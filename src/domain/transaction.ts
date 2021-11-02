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
  constructor(readonly accounts: Bank.Accounts, readonly log: Logger) {}

  loadRawRecords(transactionsFile: TransactionsFile): RawRecord[] {
    const bankfileHandler = this.getHandler(transactionsFile);
    const rawRecords = bankfileHandler.loadRawRecords(transactionsFile);
    // arguably, this could be the responsibility of bankfileHandler, but this leaves us with a single place to do it...
    // more arguably, this should just be a different type/object
    transactionsFile.rawRecords = rawRecords;
    return rawRecords;
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
export { byAmountAsc, byAmountDesc };
const byAmountAsc = (a: RawRecord, b: RawRecord) => {
  return a.amount.minus(b.amount).toNumber();
};
const byAmountDesc = (a: RawRecord, b: RawRecord) => -byAmountAsc(a, b);

// === Reducers
export { sum };

const sum = (acc: Big, curr: Transaction) => acc.plus(curr.amount);

// === Transactions Filters
export { isUncategorised, isInCategories, isBetween };
const isUncategorised = () => {
  return chainable<Transaction>((t) => {
    return t.category === UNCATEGORISED;
  });
};

const isInCategories = (categories: Category[]) => {
  return chainable<Transaction>((t) => {
    return categories.includes(t.category);
  });
};

// redundant with between filter which applies to RawRecords and is more targetted at the rules
const isBetween = (dateRange: DateRange) => {
  return chainable<Transaction>((t) => {
    return isInRange(t.date, dateRange);
  });
};
