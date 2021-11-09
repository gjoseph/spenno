import Big from "big.js";

export type AmountRange = [number, number];
export type AmountFilterType = null | "creditOnly" | "debitOnly" | "range";
export type AmountFilter = {
  type: AmountFilterType;
  range: AmountRange | null;
};

export const signedAmount = (
  debit: number,
  credit: number,
  logDetail: () => string = () => "hello"
): Big => {
  if (debit > 0 && credit > 0) {
    throw new Error("Both debit and credit are >0 " + logDetail());
  }
  if (debit > 0) {
    return new Big(-debit);
  }
  if (credit > 0) {
    return new Big(credit);
  }
  throw new Error("Both debit and credit are <=0 " + logDetail());
};

export const percentOf = (amount: number, total: number): string => {
  const number = (amount / total) * 100;
  return `${number.toFixed(1)}%`;
};

export const mustBe = (n: number, assertion: (n: number) => boolean) => {
  if (!assertion(n)) {
    throw Error(n + " is not acceptable here");
  }
  return n;
};

export const positive = (n: number) => n > 0;
export const negative = (n: number) => n < 0;

export const zer0 = new Big(0);
