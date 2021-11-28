// So, here's how I got to a seemingly working webworker-based implementation
// https://aravindballa.com/writings/non-blocking-ui-react/
// https://github.com/developit/workerize-loader#readme
// https://medium.com/@bykovskimichael/how-to-use-web-worker-with-create-react-app-e1c1f1ba5279
// and last but not least https://github.com/developit/workerize-loader/issues/3
// particularly this comment https://github.com/developit/workerize-loader/issues/3#issuecomment-538730979
// This isn't exactly a complex function, but needs to be isolated for workerize-loader to do its thing.

import { Bank } from "../domain/accounts";
import { Category } from "../domain/category";
import { FileWithRawRecords, TransactionsFile } from "../domain/file";
import { RawRecordFilters } from "../domain/filters";
import { TransactionsProcessor } from "../domain/processor";
import { Rules } from "../domain/rules";
import {
  isBetween,
  isInCategories,
  RawRecord,
  Transaction,
  TransactionsLoader,
} from "../domain/transaction";
import { ArrayLogger, LogEntry } from "../util/log";
import { AmountFilter } from "../util/util";
import {
  fromTransferrableFilesWithRawRecords,
  toTransferrable,
  toTransferrableFilesWithRawRecords,
  Transferrable,
  TransferrableDateRange,
  TransferrableFileWithRawRecords,
  transferredDateRange,
} from "./transfer";

export interface FileLoadWorkResult {
  files: TransferrableFileWithRawRecords[];
  log: LogEntry[];
}

export const reloadFiles = (
  // we're passing the whole files (File#fileContents) as string between threads, I'm not sure how efficient this is
  files: TransactionsFile[],
  // Bank.Accounts can't be cloned () so unwrapping it here and rewrapping below
  accounts: Bank.Account[]
): FileLoadWorkResult => {
  const log = new ArrayLogger(false);
  const transactionsLoader = new TransactionsLoader(
    new Bank.Accounts(accounts),
    log
  );
  const filesWithRawRecords = files.map((file) => {
    // we're reparsing the CSV everytime... how not useful
    const rawRecords: RawRecord[] = transactionsLoader.loadRawRecords(file);
    return {
      ...file,
      rawRecords,
    } as FileWithRawRecords;
  });
  return {
    files: toTransferrableFilesWithRawRecords(filesWithRawRecords),
    log: log.logEntries,
  };
};

export interface TransactionProcessWorkResult {
  transactions: Transferrable<Transaction>[];
  log: LogEntry[];
}

export const reloadTransactions = (
  // we're passing the whole files (File#fileContents) as string between threads, I'm not sure how efficient this is
  files: TransferrableFileWithRawRecords[],
  ruleDescs: Rules.RuleDesc[],
  // Bank.Accounts can't be cloned () so unwrapping it here and rewrapping below
  accounts: Bank.Account[],
  dateRange: TransferrableDateRange,
  categories: Category[],
  amountFilter: AmountFilter
): TransactionProcessWorkResult => {
  const log = new ArrayLogger(false);
  const rules = ruleDescs.map(Rules.toRule);
  const transactionsProcessor = new TransactionsProcessor(rules, log);

  // TODO it might be more efficient to apply the date filter on raw records instead
  let txFilter = isBetween(transferredDateRange(dateRange));
  if (categories.length > 0) {
    txFilter = txFilter.and(isInCategories(categories));
  }
  switch (amountFilter.type) {
    case null:
      break;
    case "creditOnly":
      txFilter = txFilter.and(RawRecordFilters.isCredit());
      break;
    case "debitOnly":
      txFilter = txFilter.and(RawRecordFilters.isDebit());
      break;
    default:
      // TODO
      console.log("work out support for ranges", amountFilter);
  }

  const filteredTransactions = fromTransferrableFilesWithRawRecords(files)
    .filter((f) => f.enabled)
    .flatMap((e) => {
      return transactionsProcessor.applyRules(e.rawRecords);
    })
    .filter(txFilter)
    .map(toTransferrable);
  log.info(
    `Total: processed ${filteredTransactions.length} records from ${files.length} files`
  );
  return {
    transactions: filteredTransactions,
    log: log.logEntries,
  };
};
