import { GridColDef } from "@mui/x-data-grid";
import { Bank } from "../../domain/accounts";
import { CellTypes } from "./util";

export const rawRecordsGridColumns = (
  accounts: Bank.Accounts
): GridColDef[] => {
  return [
    CellTypes.account(accounts),
    CellTypes.date,
    {
      field: "desc",
      headerName: "Description",
      flex: 3,
    },
    CellTypes.amount,
  ];
};
