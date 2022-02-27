import { Moment } from "moment";

declare global {
  declare module "worker-loader!*" {
    class WebpackWorker extends Worker {
      constructor();
    }

    export = WebpackWorker;
  }

  // Register jest/toEqualMoment
  namespace jest {
    interface Matchers<R> {
      toEqualMoment(m: Moment): R;
    }
  }
}
