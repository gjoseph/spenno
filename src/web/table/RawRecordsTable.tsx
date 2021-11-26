import * as React from "react";
import { Bank } from "../../domain/accounts";
import { FileWithRawRecords } from "../../domain/file";
import { RawRecord } from "../../domain/transaction";
import { groupBy } from "../../util/reducers";
import { addUniquenessSuffixToProperty } from "../../util/util";
import { DataGridWrapper } from "./DataGridWrapper";
import { rawRecordsGridColumns } from "./RawRecordsGridColumns";

export type TableTypeVariant = "all" | "duplicates";

type RawRecordWithFile = RawRecord & { filePath: string };
type RawRecordDuplicateCounts = RawRecord & {
  count: number;
  filePaths: string[];
  filePath: string /*WTF*/;
};
// Dunno why this isn't in lib.es5.d.ts but oh well
type MapFn<T, U> = (value: T, index: number, array: T[]) => U;

// const variant = (v: TableTypeVariant) :MapFn<RawRecordWithFile, any>=> {
//   switch (v) {
//     case "all":
//       return (rr:RawRecordWithFile)=>rr;
//     case "duplicates":
//       return null;
//   }
// };

export const RawRecordsTable: React.FC<{
  accounts: Bank.Accounts;
  filesWithRawRecords: FileWithRawRecords[];
  variant: TableTypeVariant;
}> = (props) => {
  const rows = props.filesWithRawRecords
    // only display enabled files
    .filter((f) => f.enabled)
    // add a file label to distinguish same-name files (also see App#fileDescs)
    .map(addUniquenessSuffixToProperty("filePath"))
    // flatmap raw records from each with filePath as an added column for each
    .flatMap((f) => {
      const map: RawRecordWithFile[] = f.rawRecords.map((record) => ({
        filePath: f.filePath, // it's a "label" really
        ...record,
      }));
      return map;
    });

  // TODO actually not sure map() will help us with counting dupes
  // .map(variant(props.variant));
  // TODO and not sure what a no-op reduce would look like
  // .reduce(...variant(props.variant));
  const duplicateReducer = groupBy((t: RawRecordWithFile) => {
    // remove filePath, since this is the only property we don't groupBy
    const { filePath, ...rest } = t;
    return rest;
  });
  const reduced = rows.reduce(...duplicateReducer);
  const duplicateCounts: RawRecordDuplicateCounts[] = reduced
    .toArray()
    .map((e) => {
      // key = rest-of-object
      // value = array-of-grouped-whole-objects
      // so we just map value's array's name property (i.e the "source of duplicate"
      const filePaths = e.value.map((o) => o.filePath);
      return { filePaths, count: filePaths.length, ...e.key };
    });
  return (
    <DataGridWrapper
      columns={rawRecordsGridColumns(props.accounts, props.variant)}
      rows={props.variant === "all" ? rows : duplicateCounts}
    />
  );
};
