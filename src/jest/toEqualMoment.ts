import { Moment } from "moment";

// COPIED FROM https://github.com/ailohq/jest-expect-moment/blob/master/src/toEqualMoment.ts
// since the author decided their lib couldn't be added with npm O_o

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatMoment(received: any): string {
  if (typeof received?.toISOString === "function") {
    return received.toISOString();
  }

  return `${received}`;
}

export function toEqualMoment(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  received: any,
  expected: Moment,
): jest.CustomMatcherResult {
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
