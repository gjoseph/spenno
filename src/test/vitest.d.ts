import "vitest";
import { Moment } from "moment/moment";

interface MomentMatchers<R = any> {
  toEqualMoment: (expected: Moment) => R;
}

declare module "vitest" {
  interface Assertion<T = any> extends MomentMatchers<T> {}
  interface AsymmetricMatchersContaining extends MomentMatchers {}
}
