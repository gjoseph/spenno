import Big from "big.js";
import moment from "moment";
import { unitOfTime } from "moment";
import { Westpac } from "../bank/westpac";
import { Logger } from "../util/log";
import { Bank } from "./accounts";
import { chainable } from "../util/filters";
import { mustBe, positive } from "../util/util";
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

export class RawRecord {
  constructor(
    readonly account: Bank.Account,
    readonly date: moment.Moment,
    readonly desc: string,
    readonly amount: Big // negative for a debit, positive for a credit
  ) {}
}

export type Category = string;
export const UNCATEGORISED: Category = "UNKNOWN";

export class Transaction extends RawRecord {
  constructor(
    readonly account: Bank.Account,
    readonly date: moment.Moment,
    readonly desc: string,
    readonly amount: Big, // negative for a debit, positive for a credit
    readonly merchant: string | null,
    readonly category: Category
  ) {
    super(account, date, desc, amount);
  }
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

// === Filtering stuff that probably needs to move away
export type DateRange = [moment.Moment | null, moment.Moment | null];

// === Transactions Filters
export { isUncategorised, isBetween };
const isUncategorised = (t: Transaction) => t.category === UNCATEGORISED;

// redundant with between filter which applies to RawRecords and is more targetted at the cli
const isBetween = (dateRange: DateRange) =>
  chainable<Transaction>((t) => {
    return t.date.isBetween(dateRange[0], dateRange[1], "day", "[]");
  });

// === RawRecords Filters
export { isDebit, isCredit, inTime, between };

type AmountCompareArgs = { min?: number; max?: number; eq?: number };

const isDebit = (args?: AmountCompareArgs) => {
  return chainable<RawRecord>((t) =>
    isPositiveAndCompare(t.amount.times(-1), args)
  );
};

const isCredit = (args?: AmountCompareArgs) => {
  return chainable<RawRecord>((t) => isPositiveAndCompare(t.amount, args));
};

const isPositiveAndCompare = (
  amount: Big,
  args: AmountCompareArgs | undefined
) => {
  return (
    amount.gt(0) &&
    (!args?.eq || amount.eq(mustBe(args.eq, positive))) &&
    (!args?.min || amount.gte(mustBe(args.min, positive))) &&
    (!args?.max || amount.lte(mustBe(args.max, positive)))
  );
};

const inTime = (value: number, unit: unitOfTime.All) =>
  chainable<RawRecord>((t) => {
    return t.date.get(unit) === value;
  });

/**
 * Returns true if the record between day from & to, inclusive.
 * @param from yyyy-mm-dd
 * @param to yyyy-mm-dd
 */
const between = (from: string, to: string) =>
  chainable<RawRecord>((r) => {
    const a = mustBeValid(from);
    const b = mustBeValid(to);
    if (a.isAfter(b)) {
      throw new Error(`${from} is after ${to}`);
    }
    return r.date.isBetween(a, b, "day", "[]");
  });

const mustBeValid = (s: string) => {
  const m = moment(s, "YYYY-MM-DD", true);
  if (!m.isValid()) {
    throw new Error(`${s} is not a valid date`);
  }
  return m;
};
