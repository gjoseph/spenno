import Big from "big.js";
import { Bank } from "../domain/accounts";
import { Category } from "../domain/category";
import { Transaction } from "../domain/transaction";
import moment from "moment";
import { DateRange } from "../util/time-util";

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

// See time-util#DateRange
// TODO get rid of moment
export type TransferrableDateRange = [string, string];
export const transferrableDateRange: (
  dateRange: DateRange
) => TransferrableDateRange = (dateRange: DateRange) => {
  return [dateRange[0]?.toISOString(), dateRange[1]?.toISOString()];
};
export const transferredDateRange: (
  dateRange: TransferrableDateRange
) => DateRange = (dateRange: TransferrableDateRange) => {
  return [moment(dateRange[0]), moment(dateRange[1])];
};
