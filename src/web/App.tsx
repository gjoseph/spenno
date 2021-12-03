import FilterListIcon from "@mui/icons-material/FilterList";
import InfoIcon from "@mui/icons-material/Info";
import DollarIcon from "@mui/icons-material/LocalAtmOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { Button, Theme, ThemeProvider } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import DialogContentText from "@mui/material/DialogContentText";
import { createTheme } from "@mui/material/styles";
import * as React from "react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import { ConsoleLogger, forwardLogs } from "../util/log";
import { DateRange, MAX_DATE_RANGE } from "../util/time-util";
import { addUniquenessSuffixToThings, AmountFilter } from "../util/util";
import * as CalculatorWorker from "../worker/transaction-filter-worker";
import {
  FileLoadWorkResult,
  TransactionProcessWorkResult,
} from "../worker/transaction-filter-worker";
import {
  fromTransferrable,
  fromTransferrableFilesWithRawRecords,
  toTransferrableFilesWithRawRecords,
  transferrableDateRange,
  TransferrableMappings,
} from "../worker/transfer";
import { FileList } from "./FileList";
import { Copyright } from "./layout/Copyright";
import { TopBar } from "./layout/Nav";
import { MainAppScreen } from "./MainAppScreen";
import { TransactionFilters } from "./TransactionFilters";
import { withDotBadge } from "./util-comps/decorators";
import { ProgressIndicator } from "./util-comps/ProgressIndicator";
import { collectFilesFrom, FileTests } from "./util/file-system-util";
import { useFetch } from "./util/hook-fetch";
import { usePersistentLocalDirectory } from "./util/hook-file-system-access";

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

const logger = new ConsoleLogger();

const calcWorker = createCalculatorWorker<typeof CalculatorWorker>();

const readAccounts = (result: string) =>
  new Bank.AccountsLoader(logger).loadYaml(result);

const readRules = (result: string) =>
  new Rules.RulesLoader(logger).loadYaml(result);

export type SetFilterConfig = Dispatch<SetStateAction<FilterConfig>>;
export type FilterConfig = {
  dateRange: DateRange;
  categories: Category[]; // currently, empty array == no filter == all categories, but we may want to have a truly "no categories" filter
  amount: AmountFilter;

  groupBy: GroupBy;
  splitBy: SplitBy;
};

async function loadFileFunction(e: FileSystemFileHandle, file: File) {
  return new TransactionsFile(file.name, "westpac.csv", await file.text());
}

const AppContent = () => {
  const [calculating, setCalculating] = useState(true);

  const [accounts, accountsLoaded, accountsError, reFetchAccounts] =
    useFetch<Bank.Accounts>(
      "/accounts.yml",
      () => new Bank.Accounts([]),
      readAccounts
    );

  const [rules, rulesLoaded, rulesError, reFetchRules] = useFetch<
    Rules.RuleDesc[]
  >("/rules.yml", () => [], readRules);
  const allCategories = useMemo(() => Rules.extractCategories(rules), [rules]);

  // TODO: keep track of files as FileDesc instead?
  const [
    localDirectoryHandle,
    dirPickerHandler,
    requestPermissions,
    clearDirectoryHandler,
  ] = usePersistentLocalDirectory("spenno_local_5");

  const [files, setFiles] = useState<TransactionsFile[]>([]);

  const asyncLoadAndSetFiles = useCallback(() => {
    if (!localDirectoryHandle || requestPermissions.status !== "granted") {
      // console.log("localDirectoryHandle not set");
      setFiles([]);
    } else {
      (async () => {
        const loadedFiles = await collectFilesFrom(
          localDirectoryHandle,
          logger,
          loadFileFunction,
          FileTests.CSV_SUFFIX
        );
        setFiles(loadedFiles);
      })();
    }
  }, [localDirectoryHandle, requestPermissions]);

  useEffect(() => {
    asyncLoadAndSetFiles();
    // retrigger this effect on handle change and on permissions change
  }, [asyncLoadAndSetFiles, localDirectoryHandle, requestPermissions]);

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
  const [filesWithRawRecords, setFilesWithRawRecords] = useState<
    FileWithRawRecords[]
  >([]);

  // The processed (categorised) and filtered transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fileDescs = useMemo<FileDescriptor[]>(() => {
    return filesWithRawRecords
      .map(
        addUniquenessSuffixToThings(
          (f: FileWithRawRecords) => f.filePath,
          (f, suffixedName) => ({ ...f, label: suffixedName })
        )
      )
      .map((f, idx) => {
        // remove rawRecords, fileContents, and inject recordCount property
        const { rawRecords, fileContents, ...fileDesc } = f;
        return {
          ...fileDesc,
          recordCount: f.rawRecords.length,
        };
      });
  }, [filesWithRawRecords]);

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
        forwardLogs(res.log, logger);
        setFilesWithRawRecords((old) => {
          const newFiles = fromTransferrableFilesWithRawRecords(res.files);
          logger.debug(
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
        toTransferrableFilesWithRawRecords(filesWithRawRecords),
        rules,
        accounts.accounts,
        txDateRange,
        filterConfig.categories,
        filterConfig.amount
      ) // TODO why does intellij think the "dateRange" param is called "files" !?
      .then((res: TransactionProcessWorkResult) => {
        forwardLogs(res.log, logger);
        setTransactions((old) => {
          const newTxs = res.transactions.map(
            fromTransferrable(TransferrableMappings.Transaction)
          );
          logger.debug("Loaded", newTxs.length, "transactions");
          return newTxs;
        });
        setCalculating((old) => false);
      });
  }, [filesWithRawRecords, rules, accounts, filterConfig]);

  const [txAmountMin, txAmountMax] = useMemo(() => {
    const amounts = filesWithRawRecords
      .flatMap((f) => f.rawRecords)
      .map((t) => t.amount.toNumber());
    return [Math.min(...amounts), Math.max(...amounts)];
  }, [filesWithRawRecords]);

  const filtersDialog = (
    <TransactionFilters
      filterConfig={filterConfig}
      setFilterConfig={setFilterConfig}
      allCategories={allCategories}
      min={txAmountMin}
      max={txAmountMax}
    />
  );

  const fileDialog = (
    <React.Fragment>
      <Button onClick={dirPickerHandler}>Select Folder</Button>
      <Button onClick={clearDirectoryHandler}>Unselect</Button>
      {requestPermissions.status !== "granted" && (
        <Button onClick={requestPermissions.callback}>perms</Button>
      )}
      {/*<FileDrop addFile={addFile(setUploadedFiles)} minimal={false}>*/}
      {/*Currently not supporting uploads or drag'n'drop
         If we wanted to, we could
         * re-add support for drag'n'drop of folders,
         * re-add support for actual uploads, which _can_ still work with FileSystemFileHandle APIs
         See e.g https://web.dev/file-system-access/#drag-and-drop-integration and https://web.dev/file-system-access/#polyfilling
      */}
      <FileList files={fileDescs} toggleFile={toggleFile} />
      {/*</FileDrop>*/}
    </React.Fragment>
  ); // TODO close on drop?

  const settingsDialog = (
    <div>
      <img
        src="logo192.png"
        alt="random <img> tag just to prove i could use any element here, not just text or <DialogContentText>"
      />
      <DialogContentText>lorem ipsum</DialogContentText>
    </div>
  );

  const infoDialog = (
    <div>
      <p>
        {accountsLoaded || "loading"}
        {accounts.accounts.length} accounts{" "}
        <Button onClick={reFetchAccounts}>Reload</Button>
        {accountsError}
      </p>
      <p>
        {rulesLoaded || "loading"}
        {rules.length} rules <Button onClick={reFetchRules}>Reload</Button>
        {rulesError}
      </p>
      <p>from {filterConfig.dateRange[0]?.toDate().toString()}</p>
      <p>to {filterConfig.dateRange[1]?.toDate().toString()}</p>
    </div>
  );

  const reloadAll = () => {
    reFetchAccounts();
    reFetchRules();
    asyncLoadAndSetFiles();
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <TopBar
        appTitle="Spenno"
        appIcon={DollarIcon}
        iconAndDialogs={[
          { icon: RefreshIcon, title: "Reload all", onClick: reloadAll },
          { icon: FilterListIcon, title: "Filters", content: filtersDialog },
          {
            icon:
              requestPermissions.status !== "granted"
                ? withDotBadge("warning")(UploadFileIcon)
                : !localDirectoryHandle
                ? withDotBadge("info")(UploadFileIcon)
                : UploadFileIcon,
            title: "Files",
            // we know onClick will take precedence over opening the dialog
            onClick:
              requestPermissions.status === "prompt"
                ? requestPermissions.callback
                : undefined,
            content: fileDialog,
            // onDrop: addFile(setFiles),
          },
          { icon: SettingsIcon, title: "Settings", content: settingsDialog },
          { icon: InfoIcon, title: "Debugging Info", content: infoDialog },
        ]}
      >
        <ProgressIndicator inProgress={calculating} type="line" />
      </TopBar>
      <Box
        component="main"
        sx={{
          backgroundColor: grayForTheme,
          flexGrow: 1,
          // height: "100vh", TODO: leaving this here for a bit, just in case but it looks like this is the reason the scrollTrigger in Nav didn't work!
          overflow: "auto",
        }}
      >
        {/*mt, aka margin-top brings our container below TopBar -- used to have value 4 _and_ an empty Toolbar instead, wtf!?*/}
        <Container maxWidth="lg" sx={{ mt: 11, mb: 4 }}>
          <MainAppScreen
            {...{
              transactions,
              filesWithRawRecords,
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
