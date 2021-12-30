import { Moment } from "moment";

declare global {
  // https://github.com/developit/workerize-loader/issues/3#issuecomment-538730979
  module "workerize-loader!*" {
    type AnyFunction = (...args: any[]) => any;
    type Async<F extends AnyFunction> = (
      ...args: Parameters<F>
    ) => Promise<ReturnType<F>>;

    type Workerized<T> = Worker & {
      [K in keyof T]: T[K] extends AnyFunction ? Async<T[K]> : never;
    };

    function createInstance<T>(): Workerized<T>;

    export = createInstance;
  }

  // Register jest/toEqualMoment
  namespace jest {
    interface Matchers<R> {
      toEqualMoment(m: Moment): R;
    }
  }
}
