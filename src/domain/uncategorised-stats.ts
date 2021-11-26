import Big from "big.js";
import { groupBy } from "../util/reducers";
import { percentOf, zer0 } from "../util/util";
import { RawRecordFilters } from "./filters";
import { isUncategorised, sum, Transaction } from "./transaction";

export interface UncategorisedStats {
  uncategorisedTransactions: Transaction[];
  percentageOfTotal: string;
  totalCredit: Big;
  totalDebit: Big;
  mostCommonDescriptions: {
    desc: string;
    count: number;
    totalAmount: Big;
  }[];
}

export const uncategorisedStats = (
  transactions: Transaction[],
  top: number
): UncategorisedStats => {
  const uncategorisedTransactions = transactions.filter(isUncategorised());

  const mostCommonDescriptions = uncategorisedTransactions
    .reduce(...groupBy((r: Transaction) => r.desc))
    .toArray()
    .map((e) => ({
      desc: e.key,
      count: e.value.length,
      totalAmount: e.value.reduce(sum, zer0),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top);

  const percentageOfTotal = percentOf(
    uncategorisedTransactions.length,
    transactions.length
  );

  const totalCredit = uncategorisedTransactions
    .filter(RawRecordFilters.isCredit())
    .reduce(sum, zer0);

  const totalDebit = uncategorisedTransactions
    .filter(RawRecordFilters.isDebit())
    .reduce(sum, zer0);

  return {
    uncategorisedTransactions,
    percentageOfTotal,
    totalCredit,
    totalDebit,
    mostCommonDescriptions,
  };
};
