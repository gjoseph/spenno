import Big from "big.js";
import moment from "moment";
import { SilentLogger } from "../util/log";
import { TransactionsProcessor } from "./processor";
import { Rules } from "./rules";
import { RawRecord } from "./transaction";

const account = { id: "1", name: "acc1" };
test("simple matching without additional condition", () => {
  const ruleDesc: Rules.RuleDesc = {
    name: "tax",
    regex: "^BPAY TAX OFFICE",
    category: "monies/tax",
  };
  const rawRx: RawRecord = {
    id: "meh",
    account: account,
    date: moment("1977-07-01"),
    desc: "BPAY TAX OFFICE FY77",
    amount: Big(-100),
  };
  const expected = expect.objectContaining({
    category: "monies/tax",
    amount: Big(-100),
    desc: "BPAY TAX OFFICE FY77",
  });
  const transactions = applyTestRules([ruleDesc], [rawRx]);
  expect(transactions).toEqual([expected]);
});

test.todo(
  "decide if multiple rules mean fallback, or if we truly enforce 1-rule-per-tx, " +
    "or somewhere in between (some rules _can_ be fallback, not others" +
    "... maybe same regex but no addCheck... or if there's only 1 rule that matches without an addCheck that's ok...)"
);

test("additionalCheck applies correctly, picks the right rule out of 2", () => {
  const ruleDesc: Rules.RuleDesc = {
    name: "Shit Coffee",
    regex: ".*",
    category: "coffee/meh",
    additionalCheck: "isDebit({ max: 2.5 })",
  };
  const ruleDescWithAddCond: Rules.RuleDesc = {
    name: "Fancy Coffee",
    regex: ".*",
    category: "coffee/hip",
    additionalCheck: "isDebit({ min: 4.0 })",
  };

  const rawRx: RawRecord[] = [
    {
      id: "not relevant for these tests",
      account,
      date: moment("1977-07-01"),
      desc: "Cheap Shitty Coffee",
      amount: Big(-2),
    },
    {
      id: "not relevant for these tests",
      account,
      date: moment("1977-07-01"),
      desc: "Fancy Hipster Coffee",
      amount: Big(-4.5),
    },
  ];
  const transactions = applyTestRules([ruleDesc, ruleDescWithAddCond], rawRx);
  expect(transactions).toStrictEqual([
    expect.objectContaining({
      category: "coffee/meh",
      amount: Big(-2),
      desc: "Cheap Shitty Coffee",
    }),
    expect.objectContaining({
      category: "coffee/hip",
      amount: Big(-4.5),
      desc: "Fancy Hipster Coffee",
    }),
  ]);
});

function applyTestRules(ruleDescs: Rules.RuleDesc[], rawRx: RawRecord[]) {
  return new TransactionsProcessor(
    ruleDescs.map(Rules.toRule),
    new SilentLogger()
  ).applyRules(rawRx);
}
