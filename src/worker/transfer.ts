import Big from "big.js";
import { Bank } from "../domain/accounts";
import { Category, DateRange, Transaction } from "../domain/transaction";
import moment from "moment";

/**
 * The current interface of Transaction holds Big.js and Moment.js fields, which
 * are not transferable between webworkers, so we use this transport object instead.
 */
export interface TransferrableTransaction {
  readonly account: Bank.Account;
  readonly date: string; // iso-8861 representation of moment
  readonly desc: string;
  readonly amount: string; // is the safest way to convert a Big without losing precision, I think?
  readonly merchant: string | null;
  readonly category: Category;
}

export const toTransferrable = (t: Transaction): TransferrableTransaction => {
  return {
    account: t.account,
    date: t.date.toISOString(),
    desc: t.desc,
    amount: t.amount.toString(),
    merchant: t.merchant,
    category: t.category,
  };
};

export const fromTransferrable = (t: TransferrableTransaction): Transaction => {
  return {
    account: t.account,
    date: moment(t.date),
    desc: t.desc,
    amount: Big(t.amount),
    merchant: t.merchant,
    category: t.category,
  };
};

// See transaction#DateRange
// TODO get rid of moment
export type TransferrableDateRange = [string | null, string | null];
export const transferrableDateRange: (
  dateRange: DateRange
) => TransferrableDateRange = (dateRange: DateRange) => {
  return [
    dateRange[0]?.toISOString() || null,
    dateRange[1]?.toISOString() || null,
  ];
};
export const transferredDateRange: (
  dateRange: TransferrableDateRange
) => DateRange = (dateRange: TransferrableDateRange) => {
  return [
    dateRange[0] ? moment(dateRange[0]) : null,
    dateRange[1] ? moment(dateRange[1]) : null,
  ];
};
