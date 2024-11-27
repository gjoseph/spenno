import { GridCellParams, GridColDef } from "@mui/x-data-grid";
import Big from "big.js";
import { Moment } from "moment";

// See momentFormatter
import "moment/locale/en-au";
import { Bank } from "../../domain/accounts";

export namespace CellFormatters {
  export const momentFormatter = (value: Moment | undefined) => {
    // obviously not the right place to change locale, but fuck those default us date formats
    return value?.format("L");
    // It seems like importing the locale was enough (it's possibly picked up by browser)
    // return value?.locale("en-AU").format("L");
  };

  // valueFormatter isn't generic, so no guarantee p.value is actually a Big!?
  export const bigFormatter = (p: Big | undefined) => {
    if (p) {
      return "$" + p.abs().toFixed(2) + (p.gte(0) ? "+" : "-");
    }
    return "";
  };
}
export namespace CellTypes {
  export const account = (accounts: Bank.Accounts) => {
    return {
      field: "account",
      headerName: "Account",
      flex: 1,
      type: "singleSelect",
      valueGetter: (value, row) => row.account.name,
      valueOptions: accounts.accounts.map((a) => a.name),
    } as GridColDef;
  };
  export const date: GridColDef = {
    field: "date",
    headerName: "Date",
    flex: 1,
    valueFormatter: CellFormatters.momentFormatter,
  };
  export const amount: GridColDef = {
    field: "amount",
    headerName: "Amount",
    type: "number",
    flex: 1,
    cellClassName: (p: GridCellParams<[amount: Big]>) => {
      const value: Big = p.value as Big;
      return value ? (value.lt(0) ? "amount-debit" : "amount-credit") : "";
    },
    valueFormatter: CellFormatters.bigFormatter,
  };
}
