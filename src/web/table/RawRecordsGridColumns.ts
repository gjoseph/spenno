import { GridColDef } from "@mui/x-data-grid";
import { Bank } from "../../domain/accounts";
import { CellTypes } from "./util";

export const rawRecordsGridColumns = (
  accounts: Bank.Accounts
): GridColDef[] => {
  return [
    {
      field: "filePath", // we can't use label here, since we have FileWithRawRecords rather than FileDescriptor
      headerName: "File",
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
