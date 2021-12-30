import Big from "big.js";
import moment from "moment";
import { RawRecordFilters } from "./filters";
import { RawRecord, Transaction } from "./transaction";

const { inTime, between, isCredit, isDebit } = RawRecordFilters;

test("inTimePeriod", () => {
  const r = withDate(moment("2020-11-21 20:16:30"));
  expect(inTime(2018, "year")(r)).toBe(false);
  expect(inTime(2020, "year")(r)).toBe(true);
});

test("between", () => {
  const r = withDate(moment("2020-11-21 20:16:30"));
  expect(between("2020-11-20", "2020-11-22")(r)).toBe(true);
  // same day should work too:
  expect(between("2020-11-21", "2020-11-21")(r)).toBe(true);
  expect(between("2020-11-10", "2020-11-20")(r)).toBe(false);
});

test("between has strict format requirements", () => {
  const r = withDate(moment("2020-11-21 20:16:30"));
  expect(() => between("2001-13-01", "2222-12-12")(r)).toThrow(
    "not a valid date"
  );
  expect(() => between("2018", "2021-12-12")(r)).toThrow("not a valid date");
  expect(() => between("2020-11", "2020-12-12")(r)).toThrow("not a valid date");
  expect(() => between("2020-11-11", "2020-12")(r)).toThrow("not a valid date");
  expect(() => between("2020-11-11", "2020")(r)).toThrow("not a valid date");
});

test.todo(
  "instead, between shouuld support YYYY and YYYY-MM at least, and detect the value to pass to as granularity"
);

test.skip("between should fail when invalid boundaries", () => {
  // range is backwards
  expect(() => between("2021", "2009")(withDate(moment()))).toThrow();
  expect(() => between("2020-10", "2020-08")(withDate(moment()))).toThrow();
  expect(() =>
    between("2009-10-10", "2009-09-10")(withDate(moment()))
  ).toThrow();
  // date is plain wrong
  expect(() =>
    between("2009-13-10", "2009-14-10")(withDate(moment()))
  ).toThrow();
  // date is not yyyy-mm-dd
  expect(() =>
    between("2009/10/10", "2009-09-10")(withDate(moment()))
  ).toThrow();
});

test("is credit with no value", () => {
  expect(isCredit()(withAmount(123))).toBe(true);
  expect(isCredit()(withAmount(-123))).toBe(false);
  expect(isCredit()(withAmount(0))).toBe(false);
});

test("is credit fails with negative max", () => {
  expect(() => {
    const foo = isCredit({ max: -100 })(withAmount(123));
  }).toThrow("-100 is not acceptable");
});

test("is credit with max value", () => {
  expect(isCredit({ max: 100 })(withAmount(123))).toBe(false);
  expect(isCredit({ max: 200 })(withAmount(123))).toBe(true);
  expect(isCredit({ max: 100 })(withAmount(-123))).toBe(false);
  expect(isCredit({ max: 100 })(withAmount(0))).toBe(false);
  // max is inclusive
  expect(isCredit({ max: 3.5 })(withAmount(3.5))).toBe(true);
  expect(isCredit({ max: 3.5 })(withAmount(3.51))).toBe(false);
});

test("is credit with min value", () => {
  expect(isCredit({ min: 200 })(withAmount(123))).toBe(false);
  expect(isCredit({ min: 100 })(withAmount(123))).toBe(true);
  expect(isCredit({ min: 100 })(withAmount(-123))).toBe(false);
  expect(isCredit({ min: 100 })(withAmount(0))).toBe(false);
  // min is inclusive
  expect(isCredit({ min: 3.5 })(withAmount(3.5))).toBe(true);
  expect(isCredit({ min: 3.51 })(withAmount(3.5))).toBe(false);
});

test("is credit with max&min value", () => {
  expect(isCredit({ min: 20, max: 100 })(withAmount(123))).toBe(false);
  expect(isCredit({ min: 100, max: 150 })(withAmount(123))).toBe(true);
  expect(isCredit({ min: 150, max: 200 })(withAmount(123))).toBe(false);
  expect(isCredit({ min: 100, max: 200 })(withAmount(-123))).toBe(false);
  expect(isCredit({ min: 10, max: 20 })(withAmount(0))).toBe(false);
});

test("is debit with no value", () => {
  expect(isDebit()(withAmount(123))).toBe(false);
  expect(isDebit()(withAmount(-123))).toBe(true);
  expect(isDebit()(withAmount(0))).toBe(false);
});

test("is debit with max value", () => {
  expect(isDebit({ max: 100 })(withAmount(-123))).toBe(false);
  expect(isDebit({ max: 200 })(withAmount(-123))).toBe(true);
  expect(isDebit({ max: 100 })(withAmount(123))).toBe(false);
  expect(isDebit({ max: 100 })(withAmount(0))).toBe(false);
  // max is inclusive
  expect(isDebit({ max: 3.5 })(withAmount(-3.5))).toBe(true);
  expect(isDebit({ max: 3.5 })(withAmount(-3.51))).toBe(false);
});

test("is debit with min value", () => {
  expect(isDebit({ min: 200 })(withAmount(-123))).toBe(false);
  expect(isDebit({ min: 100 })(withAmount(-123))).toBe(true);
  expect(isDebit({ min: 100 })(withAmount(123))).toBe(false);
  expect(isDebit({ min: 100 })(withAmount(0))).toBe(false);
  // min is inclusive
  expect(isDebit({ min: 3.5 })(withAmount(-3.5))).toBe(true);
  expect(isDebit({ min: 3.51 })(withAmount(-3.5))).toBe(false);
});

test("is debit with max&min value", () => {
  expect(isDebit({ min: 20, max: 100 })(withAmount(-123))).toBe(false);
  expect(isDebit({ min: 100, max: 150 })(withAmount(-123))).toBe(true);
  expect(isDebit({ min: 150, max: 200 })(withAmount(-123))).toBe(false);
  expect(isDebit({ min: 100, max: 200 })(withAmount(123))).toBe(false);
  expect(isDebit({ min: 10, max: 20 })(withAmount(0))).toBe(false);
});

test("filters can be chained with AND", () => {
  const testTx: Transaction = {
    id: "meh",
    account: { id: "1", name: "test account" },
    date: moment("2018-10-12"),
    desc: "test record",
    amount: new Big(-80),
    merchant: "Vain Dohr",
    category: "some/cat",
  };
  expect(isDebit({ min: 20, max: 100 }).and(inTime(2018, "year"))(testTx)).toBe(
    true
  );
  expect(isDebit({ min: 20, max: 50 }).and(inTime(2018, "year"))(testTx)).toBe(
    false
  );
  expect(isDebit({ min: 20, max: 100 }).and(inTime(2020, "year"))(testTx)).toBe(
    false
  );
  expect(inTime(2018, "year").and(isDebit({ min: 20, max: 100 }))(testTx)).toBe(
    true
  );
  expect(inTime(2018, "year").and(isDebit({ min: 20, max: 50 }))(testTx)).toBe(
    false
  );
});
test("filters can be chained with OR", () => {
  const testTx: Transaction = {
    id: "meh",
    account: { id: "1", name: "test account" },
    date: moment("2018-10-12"),
    desc: "test record",
    amount: new Big(-80),
    merchant: "Vain Dohr",
    category: "some/cat",
  };
  expect(isDebit({ min: 20, max: 100 }).or(inTime(2018, "year"))(testTx)).toBe(
    true // both true
  );
  expect(isDebit({ min: 20, max: 50 }).or(inTime(2018, "year"))(testTx)).toBe(
    true // by time
  );
  expect(isDebit({ min: 20, max: 100 }).or(inTime(2020, "year"))(testTx)).toBe(
    true // by amount
  );
  expect(inTime(2018, "year").or(isDebit({ min: 20, max: 100 }))(testTx)).toBe(
    true // both true, inverted order
  );
  expect(inTime(2017, "year").or(isDebit({ min: 20, max: 50 }))(testTx)).toBe(
    false // both false
  );
  expect(inTime(2017, "year").or(inTime(2016, "year"))(testTx)).toBe(
    false // both time, both false
  );
  expect(
    isDebit({ min: 20, max: 50 })
      .or(isDebit({ eq: 70 }))
      .or(isCredit())(testTx)
  ).toBe(
    false // both amount, both false
  );
});

const account = { id: "1", name: "test account" };
const desc = "test record";

const withAmount = (n: number): RawRecord => {
  return {
    id: "irrelevant for these tests",
    account,
    desc,
    date: moment(),
    amount: new Big(n),
  };
};

const withDate = (m: moment.Moment): RawRecord => {
  return {
    id: "irrelevant for these tests",
    account,
    desc,
    date: m,
    amount: new Big(123),
  };
};
