import { Transaction } from "./transaction";

export type ChartDesc = { title: string; data: ChartDataItem[] };
export type ChartDataItem = { name: string; value: number };

export type GroupBy =
  | "year" // TODO or use a subset or moment's TimeUnit // should we split up GroupBy "type" and "parameter"
  | "category" // the default TODO introduce depths
  | "amount" // not great name - this could just be credit vs debit, or some other amount criteria?
  | "account";

export const GroupByFunctions: Record<GroupBy, (t: Transaction) => string> = {
  year: (t) => t.date.year().toString(),
  category: (t) => t.category,
  amount: (t) => (t.amount.gt(0) ? "credit" : "debit"),
  account: (t) => t.account.name,
};

export type SplitBy = GroupBy;
// export const SplitByFunctions: Record<SplitBy, (t: Transaction) => string> = {};
