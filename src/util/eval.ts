import * as ts from "typescript";
import { RawRecordFilters } from "../domain/filters";

// https://stackoverflow.com/questions/45153848/evaluate-typescript-from-string

type Fun<A, R> = (args: A) => R;

/**
 * Evaluates a piece of string, and, if all goes well, returns an executable Function
 * TODO: is there a better way than "I" (input) to define the function signature?
 */
export const evalTSFunction = <I, O>(code: string): Fun<I, O> => {
  const js = ts.transpile(code);

  // TODO Surely, there is a nicer way to expose functions to eval()
  // (and isolate it from whatever else is available here)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isDebit, isCredit, inTime, between } = RawRecordFilters;

  // TODO how do we ensure it has the right types?
  return eval(js); // eslint-disable-line no-eval
};
