import { SyncExpectationResult } from "@vitest/expect/dist";
import { Moment } from "moment";

function formatMoment(received: any): string {
  if (typeof received?.toISOString === "function") {
    return received.toISOString();
  }

  return `${received}`;
}

// COPIED FROM https://github.com/ailohq/jest-expect-moment/blob/master/src/toEqualMoment.ts
// since the author decided their lib couldn't be added with npm O_o
export function toEqualMoment(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  received: any,
  expected: Moment,
): SyncExpectationResult {
  const pass =
    received?.isSame && typeof received.isSame === "function"
      ? received.isSame(expected)
      : received === expected;

  if (pass) {
    return {
      message: (): string =>
        `Received moment (${formatMoment(
          received,
        )}) is the same as expected (${formatMoment(expected)})`,
      pass: true,
    };
  }
  return {
    message: (): string =>
      `Received moment (${formatMoment(
        received,
      )}) is not the same as expected (${formatMoment(expected)})`,
    pass: false,
  };
}
