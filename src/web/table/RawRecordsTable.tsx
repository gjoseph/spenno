import * as React from "react";
import { Bank } from "../../domain/accounts";
import { FileWithRawRecords } from "../../domain/file";
import { DataGridWrapper } from "./DataGridWrapper";
import { rawRecordsGridColumns } from "./RawRecordsGridColumns";

export const RawRecordsTable: React.FC<{
  accounts: Bank.Accounts;
  fileWithRawRecords: FileWithRawRecords;
}> = (props) => {
  const rows = props.fileWithRawRecords.rawRecords.map((rr, recordIdx) => ({
    id: recordIdx,
    ...rr,
  }));
  return (
    <DataGridWrapper
      columns={rawRecordsGridColumns(props.accounts)}
      rows={rows}
    />
  );
};
