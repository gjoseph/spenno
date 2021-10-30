import Big from "big.js";
import moment, { unitOfTime } from "moment";
import { chainable } from "../util/chainable";
import { mustBe, positive } from "../util/util";
import type { RawRecord } from "./transaction";

export { RawRecordFilters };

// ======= RawRecord Filters
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

const RawRecordFilters = { isDebit, isCredit, inTime, between };
