import Big from "big.js";
import moment from "moment";
import { Rules } from "./rules";
import { RawRecord } from "./transaction";
import { test, expect } from "vitest";

test("Transforms a RuleDesc such that additionalCondition can be eval'd", () => {
  const ruleDesc: Rules.RuleDesc = {
    regex: ".*",
    category: "coffee/hip",
    additionalCheck: "isDebit({ min: 4.0 })",
  };

  const rule = Rules.toRule(ruleDesc);
  expect(rule.additionalCheck).toBeInstanceOf(Function);
  expect(rule.additionalCheck!(withAmount(-3))).toEqual(false);
  expect(rule.additionalCheck!(withAmount(-5))).toEqual(true);
});

test("or() can be used in rule additionalChecks (not `||`)", () => {
  const ruleDesc: Rules.RuleDesc = {
    regex: ".*",
    category: "what",
    additionalCheck: "isDebit({ eq: 4.0 }).or(isCredit({ eq: 4.0 }))",
  };

  const rule = Rules.toRule(ruleDesc);
  expect(rule.additionalCheck).toBeInstanceOf(Function);
  expect(rule.additionalCheck!(withAmount(-4))).toEqual(true);
  expect(rule.additionalCheck!(withAmount(+4))).toEqual(true);
  expect(rule.additionalCheck!(withAmount(+5))).toEqual(false);
  expect(rule.additionalCheck!(withAmount(-5))).toEqual(false);
});

test("regexp with no slash is used with no flags", () => {
  const rule = Rules.toRule(withRegexpString("^foo"));
  expect(rule.regex.test("foo bar")).toEqual(true);
  expect(rule.regex.test("bar foo")).toEqual(false);
  expect(rule.regex.test("Foo bar")).toEqual(false);
});

test("regexp slashes and no flags is fine", () => {
  const rule = Rules.toRule(withRegexpString("/^foo/"));
  expect(rule.regex.test("foo bar")).toEqual(true);
  expect(rule.regex.test("bar foo")).toEqual(false);
  expect(rule.regex.test("Foo bar")).toEqual(false);
});

test("regexp slashes and flags is taking flags into account", () => {
  const rule = Rules.toRule(withRegexpString("/^foo/i"));
  expect(rule.regex.test("foo bar")).toEqual(true);
  expect(rule.regex.test("bar foo")).toEqual(false);
  expect(rule.regex.test("Foo bar")).toEqual(true);
  expect(rule.regex.test("fOO Bar")).toEqual(true);
});

test("regexp slashes needs at least both slashes or throws exception", () => {
  expect(() => Rules.toRule(withRegexpString("/^foo"))).toThrow(
    "Invalid regular expression",
  );
});

// Not actually super keen to make this work
test.skip("regex only last slash throws exception", () => {
  expect(() => Rules.toRule(withRegexpString("^foo/"))).toThrow(
    "Invalid regular expression",
  );
  expect(() => Rules.toRule(withRegexpString("^foo/i"))).toThrow(
    "Invalid regular expression",
  );
});

test("regexp slashes and invalid flag throws exception", () => {
  expect(() => Rules.toRule(withRegexpString("/^foo/z"))).toThrow(
    /invalid flags/i,
  );
});

const withRegexpString = (r: string): Rules.RuleDesc => ({
  regex: r,
  category: "lol",
});

const withAmount = (n: number): RawRecord => {
  return {
    id: "ignore me",
    account: { id: "1", name: "test account" },
    date: moment(),
    desc: "test record",
    amount: new Big(n),
  };
};
