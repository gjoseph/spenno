import {
  GridCellParams,
  GridColDef,
  GridValueFormatterParams,
} from "@mui/x-data-grid";
import Big from "big.js";
import { Moment } from "moment";
import "moment/locale/en-au";
import { Category, UNCATEGORISED } from "../../domain/category";

export const TRANSACTIONS_GRID_COLUMNS: GridColDef[] = [
  {
    field: "account",
    headerName: "Account",
    flex: 1,
    valueGetter: (p) => p.value.name,
  },
  {
    field: "date",
    headerName: "Date",
    flex: 1,
    // It seems sorting just works -- either data grid knows about moment, or moment instances are Comparable
    valueFormatter: (p) => {
      // assuming p.value is a Moment
      const value = p.value as Moment | undefined;
      // obviously not the right place to change locale, but fuck those default us date formats
      return value?.format("L");
      // It seems like importing the locale was enough (it's possibly picked up by browser)
      // return value?.locale("en-AU").format("L");
    },
  },
  {
    field: "desc",
    headerName: "Description",
    flex: 3,
  },
  {
    field: "merchant",
    headerName: "Merchant",
    type: "number",
    flex: 2,
  },
  {
    field: "amount",
    headerName: "Amount",
    type: "number",
    flex: 1.5,
    // renderCell: (p: GridRenderCellParams<Big>) => (
    //   <AmountView amount={p.value} />
    // ),
    cellClassName: (p: GridCellParams<Big>) =>
      p.value.lt(0) ? "amount-debit" : "amount-credit",
    // valueFormatter isn't generic, so no guarantee p.value is actually a Big!?
    valueFormatter: (p: GridValueFormatterParams) => {
      if (p.value) {
        const b = p.value as Big;
        return "$" + b.abs().toString() + (b.gte(0) ? "+" : "-");
      }
      return "";
    },
  },
  {
    field: "category",
    headerName: "Category",
    flex: 2,
    // renderCell: (p: GridRenderCellParams<Category>) => (
    //   <CategoryView category={p.value} />
    // ),
    cellClassName: (p: GridCellParams<Category>) =>
      p.value === UNCATEGORISED ? "category-uncategorised" : "category",
  },
];
