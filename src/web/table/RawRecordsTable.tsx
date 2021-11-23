import * as React from "react";
import { Bank } from "../../domain/accounts";
import { FileWithRawRecords } from "../../domain/file";
import { DataGridWrapper } from "./DataGridWrapper";
import { rawRecordsGridColumns } from "./RawRecordsGridColumns";

export const RawRecordsTable: React.FC<{
  accounts: Bank.Accounts;
  filesWithRawRecords: FileWithRawRecords[];
}> = (props) => {
  const rows = props.filesWithRawRecords
    // only display enabled files
    .filter((f) => f.enabled)
    // flatmap raw records from each with filePath as an added column for each
    .flatMap((f) => {
      return f.rawRecords.map((record) => ({
        filePath: f.filePath,
        ...record,
      }));
    });

  return (
    <DataGridWrapper
      columns={rawRecordsGridColumns(props.accounts)}
      rows={rows}
    />
  );
};
