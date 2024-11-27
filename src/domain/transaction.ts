import Big from "big.js";
import moment from "moment";
import { Westpac } from "../bank/westpac";
import { chainable } from "../util/chainable";
import { Logger } from "../util/log";
import { DateRange, isInRange } from "../util/time-util";
import { Bank } from "./accounts";
import { Category, UNCATEGORISED } from "./category";
import { TransactionsFile } from "./file";

export class TransactionsLoader {
  constructor(
    readonly accounts: Bank.Accounts,
    readonly log: Logger,
  ) {}

  loadRawRecords(transactionsFile: TransactionsFile): RawRecord[] {
    const bankfileHandler = this.getHandler(transactionsFile);
    return bankfileHandler.loadRawRecords(transactionsFile);
  }

  private getHandler(transactionsFile: TransactionsFile) {
    switch (transactionsFile.type) {
      case "westpac.csv":
        return new Westpac.WestpacHandler(this.accounts, this.log);
      default:
        throw new Error("Unknown type " + transactionsFile.type);
    }
  }
}

export interface RawRecord {
  readonly id: string; // Arbitrary ID to identify the record in a list -- really just doing this for mui's datagrid
  readonly account: Bank.Account;
  readonly date: moment.Moment;
  readonly desc: string;
  readonly amount: Big; // negative for a debit, positive for a credit
}

// extends RawRecord mostly so we can use same comparators/filters
export interface Transaction extends RawRecord {
  readonly account: Bank.Account;
  readonly date: moment.Moment;
  readonly desc: string;
  readonly amount: Big; // negative for a debit, positive for a credit
  readonly merchant: string | null;
  readonly category: Category;
}

// === Sorters
export const byAmountAsc = (a: RawRecord, b: RawRecord) => {
  return a.amount.minus(b.amount).toNumber();
};
export const byAmountDesc = (a: RawRecord, b: RawRecord) => -byAmountAsc(a, b);

// === Reducers
export const sum = (acc: Big, curr: Transaction) => acc.plus(curr.amount);

// === Transactions Filters
export const isUncategorised = () => {
  return chainable<Transaction>((t) => {
    return t.category === UNCATEGORISED;
  });
};

export const isInCategories = (categories: Category[]) => {
  return chainable<Transaction>((t) => {
    return categories.includes(t.category);
  });
};

// redundant with between filter which applies to RawRecords and is more targetted at the rules
export const isBetween = (dateRange: DateRange) => {
  return chainable<Transaction>((t) => {
    return isInRange(t.date, dateRange);
  });
};
