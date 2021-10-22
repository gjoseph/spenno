import { Theme, ThemeProvider } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import * as React from "react";
import { Bank } from "../domain/accounts";
import { TransactionsFile } from "../domain/file";
import { TransactionsProcessor } from "../domain/processor";
import { Rules } from "../domain/rules";
import { Transaction, TransactionsLoader } from "../domain/transaction";
import { ConsoleLogger, Logger } from "../util/log";
import { Copyright } from "./layout/Copyright";
import { TopBar } from "./layout/Nav";
import { MainAppScreen } from "./MainAppScreen";
import { Temp } from "./Temp";

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

const reloadTransactions = (
  files: TransactionsFile[],
  rules: Rules.Rule[],
  accounts: Bank.Accounts,
  log: Logger
): Transaction[] => {
  const transactionsLoader = new TransactionsLoader(accounts, log);
  const transactionsProcessor = new TransactionsProcessor(rules, log);
  const processed = files.flatMap((f) => {
    const rawRecords = transactionsLoader.loadRawRecords(f);
    return transactionsProcessor.applyRules(rawRecords);
  });
  log.info(
    `Total: processed ${processed.length} records from ${files.length} files`
  );
  return processed;
};
const AppContent = () => {
  const log = useMemo(() => new ConsoleLogger(), []);
  // TODO accounts
  const accounts = useMemo(() => new Bank.Accounts(Temp.Temp_Accounts), []);
  // TODO rules
  const rules = Temp.Temp_Rules;

  const [files, setFiles] = useState<TransactionsFile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setTransactions(reloadTransactions(files, rules, accounts, log));
  }, [files, rules, accounts, log]);

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
          <MainAppScreen
            files={files}
            setFiles={setFiles}
            transactions={transactions}
            accounts={accounts}
          />
          <Copyright />
        </Container>
      </Box>
    </Box>
  );
};
