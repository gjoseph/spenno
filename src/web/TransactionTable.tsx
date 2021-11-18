import { DataGrid, GridColDef } from "@mui/x-data-grid";
import * as React from "react";
import { Bank } from "../domain/accounts";
import { Transaction } from "../domain/transaction";
import { QuickSearchToolbar } from "./table/QuickSearchToolbar";

import { transactionsGridColumns } from "./table/TransactionsGridColumns";

const escapeRegExp = (value: string): string => {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

export const TransactionTable: React.FC<{
  accounts: Bank.Accounts;
  transactions: Transaction[];
}> = (props) => {
  return (
    <DataGridWrapper
      rows={props.transactions}
      columns={transactionsGridColumns(props.accounts)}
    />
  );
};

const genericRowFilter = (searchRegex: RegExp) => (row: any) => {
  return Object.keys(row).some((field: any) => {
    return searchRegex.test(row[field]?.toString());
  });
};

type DataGridWrapperProps<T> = {
  rows: T[];
  columns: GridColDef[];
};

export const DataGridWrapper = <T,>(props: DataGridWrapperProps<T>) => {
  const [rows, setRows] = React.useState<T[]>(() => {
    // TODO: not sure initialState is needed, since we have a useEffect below that also sets it
    return props.rows;
  });

  const [searchText, setSearchText] = React.useState("");
  const requestSearch = (searchValue: string) => {
    setSearchText(searchValue);
    const searchRegex = new RegExp(escapeRegExp(searchValue), "i");
    const filteredRows = props.rows.filter(genericRowFilter(searchRegex));
    setRows(filteredRows);
  };

  React.useEffect(() => {
    setRows(props.rows);
  }, [props.rows]);

  return (
    <React.Fragment>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ flexGrow: 1 }}>
          <DataGrid
            columns={props.columns}
            rows={rows}
            getRowId={(row) => row.id} // Just for clarity, since this is the default behaviour if getRowId is not specified
            pageSize={100}
            rowsPerPageOptions={[-1]} // disable rowsPerPage selector
            autoHeight
            density="compact"
            disableSelectionOnClick
            disableColumnMenu // we always want all our columns
            components={{ Toolbar: QuickSearchToolbar }}
            componentsProps={{
              toolbar: {
                value: searchText,
                onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                  requestSearch(event.target.value),
                clearSearch: () => requestSearch(""),
              },
            }}
          />
        </div>
      </div>
    </React.Fragment>
  );
};
