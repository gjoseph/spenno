import { groupBy } from "../util/reducers";
import { ALL_YEARS } from "../util/time-util";
import { zer0 } from "../util/util";
import { RawRecordFilters } from "./filters";
import { sum, Transaction } from "./transaction";

export type { ChartDesc, ChartDataItem, GroupBy, SplitBy };
export { GroupByFunctions, SplitByFunctions, getChartsFor };

type ChartDesc = { title: string; data: ChartDataItem[] };
type ChartDataItem = { name: string; value: number };

type GroupBy =
  | "year" // TODO or use a subset or moment's TimeUnit // should we split up GroupBy "type" and "parameter"
  | "category" // the default TODO introduce depths
  | "amount" // not great name - this could just be credit vs debit, or some other amount criteria?
  | "account";

const GroupByFunctions: Record<GroupBy, (t: Transaction) => string> = {
  year: (t) => t.date.year().toString(),
  category: (t) => t.category,
  amount: (t) => (t.amount.gt(0) ? "credit" : "debit"),
  account: (t) => t.account.name,
};

const chartDataGroupedBy = (
  transactions: Transaction[],
  whatToGroupBy: GroupBy
): ChartDataItem[] => {
  const groupByFunction = GroupByFunctions[whatToGroupBy];
  return transactions
    .reduce(...groupBy(groupByFunction))
    .toArray()
    .map((e) => {
      return {
        name: e.key,
        value: e.value.reduce(sum, zer0).abs().toNumber(),
      };
    });
};

type TransactionFilter = (t: Transaction) => boolean;
const makeChart = (
  title: string,
  predicate: TransactionFilter,
  whatToGroupBy: GroupBy,
  transactions: Transaction[]
): ChartDesc => ({
  title,
  data: chartDataGroupedBy(transactions.filter(predicate), whatToGroupBy),
});

type ChartMakerSauce = { title: string; predicate: TransactionFilter };

const makeCharts: (sauce: ChartMakerSauce[]) => ChartMaker = (
  sauce: ChartMakerSauce[]
) => {
  return (whatToGroupBy: GroupBy, transactions: Transaction[]) =>
    sauce.map((x) => {
      return makeChart(x.title, x.predicate, whatToGroupBy, transactions);
    });
};

type ChartMaker = (
  whatToGroupBy: GroupBy,
  transactions: Transaction[]
) => ChartDesc[];

type SplitBy = GroupBy;
const SplitByFunctions: Record<SplitBy, () => ChartMaker> = {
  amount: () =>
    makeCharts([
      { title: "Credits", predicate: RawRecordFilters.isCredit() },
      {
        title: "Debits",
        predicate: RawRecordFilters.isDebit(),
      },
    ]),
  year: () =>
    makeCharts(
      // TODO actually we can reimplement this with a groupBy
      ALL_YEARS.map((y) => ({
        title: y.toString(),
        predicate: (t) => t.date.year() === y,
      }))
    ),
  category: () => {
    throw new Error("Split by category is not implemented yet!");
  },
  account: () => {
    return (whatToGroupBy: GroupBy, transactions: Transaction[]) => {
      const map = transactions.reduce(...groupBy(GroupByFunctions["account"]));
      return map.toArray().map((e: { key: string; value: Transaction[] }) => {
        // predicate shoulndn't be required here, `value` is already filtered via the first groupBy
        return makeChart(e.key, (t) => true, whatToGroupBy, e.value);
      });
    };
  },
};

// TODO we should do this in the webworker
const getChartsFor = (
  whatToSplitBy: SplitBy,
  whatToGroupBy: GroupBy,
  transactions: Transaction[]
) => {
  const chartMaker = SplitByFunctions[whatToSplitBy]();
  return chartMaker(whatToGroupBy, transactions);
};
