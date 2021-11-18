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
    .flatMap((f) => f.rawRecords);

  return (
    <DataGridWrapper
      columns={rawRecordsGridColumns(props.accounts)}
      rows={rows}
    />
  );
};
