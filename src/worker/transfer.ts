import Big from "big.js";
import moment from "moment";
import { FileWithRawRecords, TransactionsFile } from "../domain/file";
import { RawRecord, Transaction } from "../domain/transaction";
import { DateRange } from "../util/time-util";

/**
 * A type which remaps "Big" and moment.Moment properties to string, so they can we transferred to webworkers.
 */
export type Transferrable<T> = {
  [P in keyof T]: T[P] extends Big | moment.Moment ? string : T[P];
};

// type BigsIn<T> = {
//   [P in keyof T]: T[P] extends Big ? true : false;
// };
//
// type MomentsIn<T> = {
//   [P in keyof T]: T[P] extends Big ? true : false;
// };
//
// type ProblematicProperties<T> = {
//   [P in keyof T]: Exclude<T[P], undefined> extends Big | moment.Moment
//     ? P
//     : never;
// }[keyof T];
//
// type OnlyBigs<T> = Pick<T, ProblematicProperties<T>>;
// type OnlyNonBigs<T> = Omit<T, ProblematicProperties<T>>;

// <T> here is "useful" to indicate what the TransferrableMapping applies to, and somehow useful for compiler to know which Object.entries method to call
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type TransferrableMapping<T> = {
  big: string[];
  moment: string[];
};
export namespace TransferrableMappings {
  export const RawRecordTM = {
    big: ["amount"],
    moment: ["date"],
  };
  export const TransactionTM: TransferrableMapping<Transaction> = {
    big: ["amount"],
    moment: ["date"],
  };
  export const DateRangeTM: TransferrableMapping<DateRange> = {
    big: [],
    moment: [],
  };
}

export const toTransferrable = <T extends {}>(t: T): Transferrable<T> => {
  const map = Object.entries(t).map((e: [string, any]) => {
    const k = e[0];
    const v = e[1];
    if (v instanceof Big) {
      return [k, v.toString()];
    } else if (moment.isMoment(v)) {
      return [k, v.toISOString()];
    } else {
      return [k, v];
    }
  });
  return Object.fromEntries(map);
};

// Returns a function for the given mapping which can then be used in [].map() calls
export const fromTransferrable =
  <T>(mapping: TransferrableMapping<T>) =>
  (t: Transferrable<T>): T => {
    const map: [string, any][] = Object.entries(t).map((e: [string, any]) => {
      const k = e[0];
      const v = e[1];
      if (mapping.big.includes(k)) {
        return [k, Big(v)];
      } else if (mapping.moment.includes(k)) {
        return [k, moment(v)];
      } else {
        return [k, v];
      }
    });
    return Object.fromEntries(map) as T;
  };

// See time-util#DateRange
// TODO get rid of moment
export type TransferrableDateRange = [string, string];
export const transferrableDateRange: (
  dateRange: DateRange
) => TransferrableDateRange = (dateRange: DateRange) => {
  return [dateRange[0]?.toISOString(), dateRange[1]?.toISOString()];
};
export const transferredDateRange: (
  dateRange: TransferrableDateRange
) => DateRange = (dateRange: TransferrableDateRange) => {
  return [moment(dateRange[0]), moment(dateRange[1])];
};

export interface TransferrableFileWithRawRecords extends TransactionsFile {
  rawRecords: Transferrable<RawRecord>[];
}

export const fromTransferrableFilesWithRawRecords = (
  files: TransferrableFileWithRawRecords[]
) =>
  files.map((f) => {
    return {
      ...f,
      rawRecords: f.rawRecords.map(
        fromTransferrable(TransferrableMappings.RawRecordTM)
      ),
    };
  });
export const toTransferrableFilesWithRawRecords = (
  files: FileWithRawRecords[]
) =>
  files.map((f) => {
    return { ...f, rawRecords: f.rawRecords.map(toTransferrable) };
  });
