import { Theme, ThemeProvider } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme } from "@mui/material/styles";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import createCalculatorWorker from "workerize-loader!../worker/transaction-filter-worker"; // eslint-disable-line import/no-webpack-loader-syntax
import { Bank } from "../domain/accounts";
import { TransactionsFile } from "../domain/file";
import { Rules } from "../domain/rules";
import { DateRange, Transaction } from "../domain/transaction";
import { ConsoleLogger } from "../util/log";
import { WorkResult } from "../worker/transaction-filter-worker";
import * as CalculatorWorker from "../worker/transaction-filter-worker";
import { fromTransferrable, transferrableDateRange } from "../worker/transfer";
import { Copyright } from "./layout/Copyright";
import { TopBar } from "./layout/Nav";
import { MainAppScreen } from "./MainAppScreen";
import { SimpleProgressIndicator } from "./util-comps/Progress";

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

const calcWorker = createCalculatorWorker<typeof CalculatorWorker>();

const AppContent = () => {
  const log = useMemo(() => new ConsoleLogger(), []);

  const [calculating, setCalculating] = useState(true);

  const [accounts, setAccounts] = useState<Bank.Accounts>(
    () => new Bank.Accounts([])
  );
  const [accountsLoaded, setAccountsLoaded] = useState<boolean>(false);
  const [accountsError, setAccountsError] = useState<boolean>(false);
  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/accounts.yml")
      .then((res) => res.text())
      .then(
        (result) => {
          setAccounts(new Bank.AccountsLoader(log).loadYaml(result));
          setAccountsLoaded(true);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          setAccountsError(error);
          setAccountsLoaded(true);
        }
      );
  }, [log]);
  const [rules, setRules] = useState<Rules.Rule[]>(() => []);
  const [rulesLoaded, setRulesLoaded] = useState<boolean>(false);
  const [rulesError, setRulesError] = useState<boolean>(false);
  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/rules.yml")
      .then((res) => res.text())
      .then(
        (result) => {
          setRules(new Rules.RulesLoader(log).loadYaml(result));
          setRulesLoaded(true);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          setRulesError(error);
          setRulesLoaded(true);
        }
      );
  }, [log]);

  const [files, setFiles] = useState<TransactionsFile[]>([]);

  const [dateRange, setDateRange] = useState<DateRange>(() => [null, null]);

  // is transaction state, or is it just a variable ...
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // this feels like we should understand memos instead...
  useEffect(() => {
    setCalculating((old) => true);
    const txDateRange = transferrableDateRange(dateRange);
    calcWorker
      .reloadTransactions(files, rules, accounts.accounts, txDateRange) // TODO why does intellij think the "dateRange" param is called "files" !?
      .then((res: WorkResult) => {
        setTransactions((old) => {
          const newTxs = res.transactions.map(fromTransferrable);
          consoleLogger.debug("Loaded", newTxs.length, "transactions");
          return newTxs;
        });
        setCalculating((old) => false);
      });
  }, [files, rules, accounts, dateRange, log]);

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
          />
          <Copyright />
        </Container>
      </Box>
    </Box>
  );
};
