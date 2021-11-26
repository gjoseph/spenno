import { CellTypes } from "./util";

export const mostCommonDescriptionsColumns = [
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
