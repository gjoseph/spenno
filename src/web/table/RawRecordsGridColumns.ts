import { GridColDef } from "@mui/x-data-grid";
import { Bank } from "../../domain/accounts";
import { TableTypeVariant } from "./RawRecordsTable";
import { CellTypes } from "./util";

export const rawRecordsGridColumns = (
  accounts: Bank.Accounts,
  variant: TableTypeVariant
): GridColDef[] => {
  return [
    {
      field: "filePath", // it's a "label", really
      headerName: "File",
      flex: 1,
    },
    {
      field: "filePaths", // it's a "label", really
      headerName: "Files",
      flex: 1,
    },
    {
      field: "count",
      headerName: "Dupe counts",
      flex: 1,
    },
    CellTypes.account(accounts),
    CellTypes.date,
    {
      field: "desc",
      headerName: "Description",
      flex: 4,
    },
    CellTypes.amount,
  ];
};
