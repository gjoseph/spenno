import { Theme, ThemeProvider } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme } from "@mui/material/styles";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import createCalculatorWorker from "workerize-loader!../worker/transaction-filter-worker"; // eslint-disable-line import/no-webpack-loader-syntax
import { Bank } from "../domain/accounts";
import { Category } from "../domain/category";
import { TransactionsFile } from "../domain/file";
import { Rules } from "../domain/rules";
import { Transaction } from "../domain/transaction";
import { ConsoleLogger } from "../util/log";
import { WorkResult } from "../worker/transaction-filter-worker";
import * as CalculatorWorker from "../worker/transaction-filter-worker";
import { fromTransferrable, transferrableDateRange } from "../worker/transfer";
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

  const [files, setFiles] = useState<TransactionsFile[]>([]);

  const [dateRange, setDateRange] = useState<DateRange>(() => MAX_DATE_RANGE);
  const [categories, setCategories] = useState<Category[]>(() => []);

  // The filtered transactions to render
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // TODO should we stagger this effect so it doesn't get executed 5 times on first load? And/or bypass it while there are no files, rules and accounts
  useEffect(() => {
    setCalculating((old) => true);
    const txDateRange = transferrableDateRange(dateRange);
    calcWorker
      .reloadTransactions(
        files,
        rules,
        accounts.accounts,
        txDateRange,
        categories
      ) // TODO why does intellij think the "dateRange" param is called "files" !?
      .then((res: WorkResult) => {
        setTransactions((old) => {
          const newTxs = res.transactions.map(fromTransferrable);
          consoleLogger.debug("Loaded", newTxs.length, "transactions");
          return newTxs;
        });
        setCalculating((old) => false);
      });
  }, [files, rules, accounts, dateRange, categories]);

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
          <p>from {dateRange[0]?.toDate().toString()}</p>
          <p>to {dateRange[1]?.toDate().toString()}</p>
          <MainAppScreen
            files={files}
            setFiles={setFiles}
            transactions={transactions}
            accounts={accounts}
            // how to make passing filters around less verbose?
            dateRange={dateRange}
            setDateRange={setDateRange}
            allCategories={allCategories}
            setCategories={setCategories}
          />
          <Copyright />
        </Container>
      </Box>
    </Box>
  );
};
