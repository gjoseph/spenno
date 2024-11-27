import { Moment } from "moment";

declare global {
  // Register jest/toEqualMoment
  namespace jest {
    interface Matchers<R> {
      toEqualMoment(m: Moment): R;
    }
  }
}
