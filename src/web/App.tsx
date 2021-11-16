import { Theme, ThemeProvider } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme } from "@mui/material/styles";
import * as React from "react";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import createCalculatorWorker from "workerize-loader!../worker/transaction-filter-worker"; // eslint-disable-line import/no-webpack-loader-syntax
import { Bank } from "../domain/accounts";
import { Category } from "../domain/category";
import { GroupBy, SplitBy } from "../domain/charting";
import {
  FileDescriptor,
  FileWithRawRecords,
  TransactionsFile,
} from "../domain/file";
import { Rules } from "../domain/rules";
import { Transaction } from "../domain/transaction";
import { ConsoleLogger } from "../util/log";
import { AmountFilter } from "../util/util";
import {
  FileLoadWorkResult,
  TransactionProcessWorkResult,
} from "../worker/transaction-filter-worker";
import * as CalculatorWorker from "../worker/transaction-filter-worker";
import {
  fromTransferrable,
  fromTransferrableFilesWithRawRecords,
  toTransferrableFilesWithRawRecords,
  transferrableDateRange,
  TransferrableMappings,
} from "../worker/transfer";
import { Copyright } from "./layout/Copyright";
import { TopBar } from "./layout/Nav";
import { MainAppScreen } from "./MainAppScreen";
import { DateRange, MAX_DATE_RANGE } from "../util/time-util";
import { SimpleProgressIndicator } from "./util-comps/Progress";
import { useFetch } from "./util/hook-fetch";

export default function App() {
  return (
    <ThemeProvider theme={mdTheme}>
      <AppContent />
    </ThemeProvider>
  );
}

const mdTheme = createTheme();
const grayForTheme = (theme: Theme) =>
  theme.palette.mode === "light"
    ? theme.palette.grey[100]
    : theme.palette.grey[900];

const consoleLogger = new ConsoleLogger();

const calcWorker = createCalculatorWorker<typeof CalculatorWorker>();

const reloadAccounts = (result: string) =>
  new Bank.AccountsLoader(consoleLogger).loadYaml(result);

const reloadRules = (result: string) =>
  new Rules.RulesLoader(consoleLogger).loadYaml(result);

export type SetFilterConfig = Dispatch<SetStateAction<FilterConfig>>;
export type FilterConfig = {
  dateRange: DateRange;
  categories: Category[]; // currently, empty array == no filter == all categories, but we may want to have a truly "no categories" filter
  amount: AmountFilter;

  groupBy: GroupBy;
  splitBy: SplitBy;
};

const AppContent = () => {
  const [calculating, setCalculating] = useState(true);

  const [accounts, accountsLoaded, accountsError] = useFetch<Bank.Accounts>(
    "/accounts.yml",
    () => new Bank.Accounts([]),
    reloadAccounts
  );
  const [rules, rulesLoaded, rulesError] = useFetch<Rules.RuleDesc[]>(
    "/rules.yml",
    () => [],
    reloadRules
  );
  const allCategories = useMemo(() => Rules.extractCategories(rules), [rules]);

  // TODO: FileDesc instead?
  const [files, setFiles] = useState<TransactionsFile[]>([]);

  const [filterConfig, setFilterConfig] = useState<FilterConfig>(() => ({
    dateRange: MAX_DATE_RANGE,
    categories: [],
    amount: {
      type: null,
      range: null,
    },
    groupBy: "category",
    splitBy: "amount",
  }));

  // The parsed files with raw records
  const [filesWithRecords, setFilesWithRecords] = useState<
    FileWithRawRecords[]
  >([]);

  // The filtered transactions to render
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fileDescs = useMemo<FileDescriptor[]>(() => {
    return filesWithRecords.map((f) => {
      return {
        ...f,
        recordCount: f.rawRecords.length,
      };
    });
  }, [filesWithRecords]);

  const addFile = (filename: string, contents: string) => {
    setFiles((prevValue) => {
      prevValue.push(new TransactionsFile(filename, "westpac.csv", contents));
      return prevValue.slice(); // i forgot why exactly but without this shit breaks
    });
  };

  const toggleFile = (fileId: string, enabled: boolean) => {
    setFiles((prevValue) => {
      const transactionsFile = prevValue.find((f) => f.id === fileId);
      if (!transactionsFile) {
        throw new Error("File with id " + fileId + " not found!?");
      }
      transactionsFile.enabled = enabled;
      return prevValue.slice();
    });
  };

  // TODO should we stagger these effects so it doesn't get executed 5 times on first load? And/or bypass it while there are no files, rules and accounts
  useEffect(() => {
    setCalculating((old) => true);
    calcWorker
      .reloadFiles(files, accounts.accounts)
      .then((res: FileLoadWorkResult) => {
        setFilesWithRecords((old) => {
          const newFiles = fromTransferrableFilesWithRawRecords(res.files);
          consoleLogger.debug(
            "Loaded",
            newFiles.length,
            "files with",
            newFiles.map((f) => f.rawRecords.length),
            "raw records"
          );
          return newFiles;
        });
        setCalculating((old) => false);
      });
  }, [files, accounts]);
  useEffect(() => {
    setCalculating((old) => true);
    const txDateRange = transferrableDateRange(filterConfig.dateRange);
    calcWorker
      .reloadTransactions(
        toTransferrableFilesWithRawRecords(filesWithRecords),
        rules,
        accounts.accounts,
        txDateRange,
        filterConfig.categories,
        filterConfig.amount
      ) // TODO why does intellij think the "dateRange" param is called "files" !?
      .then((res: TransactionProcessWorkResult) => {
        setTransactions((old) => {
          const newTxs = res.transactions.map(
            fromTransferrable(TransferrableMappings.Transaction)
          );
          consoleLogger.debug("Loaded", newTxs.length, "transactions");
          return newTxs;
        });
        setCalculating((old) => false);
      });
  }, [filesWithRecords, rules, accounts, filterConfig]);

  const [txAmountMin, txAmountMax] = useMemo(() => {
    const amounts = filesWithRecords
      .flatMap((f) => f.rawRecords)
      .map((t) => t.amount.toNumber());
    const numbers = [Math.min(...amounts), Math.max(...amounts)];
    console.log("min,max:", numbers);
    return numbers;
  }, [filesWithRecords]);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <TopBar />
      <Box
        component="main"
        sx={{
          backgroundColor: grayForTheme,
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
        }}
      >
        {/*mt, aka margin-top brings our container below TopBar -- used to have value 4 _and_ an empty Toolbar instead, wtf!?*/}
        <Container maxWidth="lg" sx={{ mt: 11, mb: 4 }}>
          <SimpleProgressIndicator inProgress={calculating} />
          <p>
            {accountsLoaded || "loading"}
            {accounts.accounts.length} accounts [button to reload]{" "}
            {accountsError}
          </p>
          <p>
            {rulesLoaded || "loading"}
            {rules.length} rules [button to reload] {rulesError}
          </p>
          <p>from {filterConfig.dateRange[0]?.toDate().toString()}</p>
          <p>to {filterConfig.dateRange[1]?.toDate().toString()}</p>
          <MainAppScreen
            {...{
              addFile,
              toggleFile,
              transactions,
              accounts,
              allCategories,

              filterConfig,
              setFilterConfig,
            }}
            min={txAmountMin}
            max={txAmountMax}
            files={fileDescs}
          />
          <Copyright />
        </Container>
      </Box>
    </Box>
  );
};
