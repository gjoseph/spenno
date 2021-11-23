import { GridCellParams, GridColDef } from "@mui/x-data-grid";
import { Bank } from "../../domain/accounts";
import { Category, UNCATEGORISED } from "../../domain/category";
import { CellTypes } from "./util";

export const transactionsGridColumns = (
  accounts: Bank.Accounts
): GridColDef[] => {
  return [
    CellTypes.account(accounts),
    CellTypes.date,
    {
      field: "desc",
      headerName: "Description",
      flex: 4,
    },
    {
      field: "merchant",
      headerName: "Merchant",
      type: "number",
      flex: 2,
    },
    CellTypes.amount,
    {
      field: "category",
      headerName: "Category",
      flex: 3,
      // renderCell: (p: GridRenderCellParams<Category>) => (
      //   <CategoryView category={p.value} />
      // ),
      cellClassName: (p: GridCellParams<Category>) =>
        p.value === UNCATEGORISED ? "category-uncategorised" : "category",
    },
  ];
};
