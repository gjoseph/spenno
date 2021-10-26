// So, here's how I got to a seemingly working webworker-based implementation
// https://aravindballa.com/writings/non-blocking-ui-react/
// https://github.com/developit/workerize-loader#readme
// https://medium.com/@bykovskimichael/how-to-use-web-worker-with-create-react-app-e1c1f1ba5279
// and last but not least https://github.com/developit/workerize-loader/issues/3
// particularly this comment https://github.com/developit/workerize-loader/issues/3#issuecomment-538730979
// This isn't exactly a complex function, but needs to be isolated for workerize-loader to do its thing.

import { Bank } from "../domain/accounts";
import { TransactionsFile } from "../domain/file";
import { TransactionsProcessor } from "../domain/processor";
import { Rules } from "../domain/rules";
import { isBetween, TransactionsLoader } from "../domain/transaction";
import { ArrayLogger, LogEntry } from "../util/log";
import {
  toTransferrable,
  TransferrableDateRange,
  TransferrableTransaction,
  transferredDateRange,
} from "./transfer";

export interface WorkResult {
  transactions: TransferrableTransaction[];
  log: LogEntry[];
}

export const reloadTransactions = (
  files: TransactionsFile[],
  rules: Rules.Rule[],
  // Bank.Accounts can't be cloned () so unwrapping it here and rewrapping below
  accounts: Bank.Account[],
  dateRange: TransferrableDateRange
): WorkResult => {
  const log = new ArrayLogger(false);
  const transactionsLoader = new TransactionsLoader(
    new Bank.Accounts(accounts),
    log
  );
  const transactionsProcessor = new TransactionsProcessor(rules, log);
  const transactions = files
    .filter((f) => f.enabled)
    .flatMap((f) => {
      const rawRecords = transactionsLoader.loadRawRecords(f);
      return transactionsProcessor.applyRules(rawRecords);
    })
    // TODO it might be more efficient to apply the date filter on raw records instead
    .filter(isBetween(transferredDateRange(dateRange)))
    .map(toTransferrable);
  log.info(
    `Total: processed ${transactions.length} records from ${files.length} files`
  );
  return {
    transactions: transactions,
    log: log.logEntries,
  };
};
