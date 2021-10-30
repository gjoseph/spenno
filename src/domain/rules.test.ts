import Big from "big.js";
import moment from "moment";
import { Rules } from "./rules";
import { RawRecord } from "./transaction";

test("Transforms a RuleDesc such that additionalCondition can be eval'd", () => {
  const ruleDesc: Rules.RuleDesc = {
    name: "Fancy Coffee",
    regex: ".*",
    category: "coffee/hip",
    additionalCheck: "isDebit({ min: 4.0 })",
  };

  const rule = Rules.toRule(ruleDesc);
  expect(rule.additionalCheck).toBeInstanceOf(Function);
  expect(rule.additionalCheck!(withAmount(-3))).toEqual(false);
  expect(rule.additionalCheck!(withAmount(-5))).toEqual(true);
});

const withAmount = (n: number): RawRecord => {
  return {
    account: { id: "1", name: "test account" },
    date: moment(),
    desc: "test record",
    amount: new Big(n),
  };
};
