import { RawRecordFilters } from "../domain/filters";

// Initially, I thought i'd need/want to use typescript in rules for evaluation and tried using this:
// https://stackoverflow.com/questions/45153848/evaluate-typescript-from-string
// but that ended up problematic with webpack:
// https://github.com/microsoft/TypeScript/issues/39436#issuecomment-817029140
// .. but as it turns out, our currently rules work just as well in plain js.

type Fun<A, R> = (args: A) => R;

/**
 * Evaluates a piece of string, and, if all goes well, returns an executable Function
 * TODO: is there a better way than "I" (input) to define the function signature?
 */
export const evalAsFunction = <I, O>(code: string): Fun<I, O> => {
  // const js = ts.transpile(code);

  // TODO Surely, there is a nicer way to expose functions to eval()
  // (and isolate it from whatever else is available here)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isDebit, isCredit, inTime, between } = RawRecordFilters;

  // TODO how do we ensure it has the right types?
  try {
    return eval(code); // eslint-disable-line no-eval
  } catch (e: any) {
    // TODO still not sure what e exactly is ...
    // console.log("typeof e", typeof e)
    // console.log("Object.keys(e): ", Object.keys(e))
    throw new Error(
      `Could not evaluate rule additionalCheck \`${code}\`: ${e.message}`
    );
  }
};
