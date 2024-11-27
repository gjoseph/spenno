import { GridColDef } from "@mui/x-data-grid";
import { CellTypes } from "./util";

export const mostCommonDescriptionsColumns: GridColDef[] = [
  {
    field: "desc",
    headerName: "Description",
    flex: 4,
  },
  {
    field: "count",
    headerName: "Occurences",
    type: "number",
    flex: 1,
  },
  { ...CellTypes.amount, field: "totalAmount" },
];
