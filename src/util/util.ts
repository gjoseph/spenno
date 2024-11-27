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
  logDetail: () => string = () => "hello",
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

// Other random utilities...
type StringOccurenceCounter = {
  [key: string]: number;
};

type StringOccurenceFormatter = (s: string, c: number) => string;

const defaultSuffixFormat = (s: string, c: number) => {
  return c > 1 ? `${s} (${c})` : s;
};

const formatStringsWithCounter = (
  formatter: StringOccurenceFormatter = defaultSuffixFormat,
) => {
  const counts: StringOccurenceCounter = {};
  return (s: string) => {
    if (counts[s] === undefined) {
      counts[s] = 1;
    } else {
      counts[s]++;
    }
    return formatter(s, counts[s]);
  };
};

export const addUniquenessSuffix = (
  formatter: StringOccurenceFormatter = defaultSuffixFormat,
) => {
  return formatStringsWithCounter(formatter);
};

export const addUniquenessSuffixToThings = <T, U>(
  extractor: (item: T) => string,
  replacer: (item: T, suffixedString: string) => U,
  formatter: StringOccurenceFormatter = defaultSuffixFormat,
) => {
  const formatStrings = formatStringsWithCounter(formatter);
  return (t: T) => {
    const formattedString = formatStrings(extractor(t));
    return replacer(t, formattedString);
  };
};

// type magic largely inspired by https://stackoverflow.com/questions/46583883/typescript-pick-properties-with-a-defined-type#
type PickStringProps<T> = {
  [P in keyof T as T[P] extends string ? P : never]: string;
};

/**
 * Simpler function that'll only allow working on a property of T whose value is a string.
 * Returns a function that can be used in Array.map()
 */
export const addUniquenessSuffixToProperty = <T extends PickStringProps<T>>(
  property: keyof PickStringProps<T>,
  formatter: StringOccurenceFormatter = defaultSuffixFormat,
) => {
  return addUniquenessSuffixToThings(
    (t: T) => t[property],
    (t, formattedString) => ({ ...t, [property]: formattedString }),
    formatter,
  );
};
