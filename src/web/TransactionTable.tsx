import { DataGrid } from "@mui/x-data-grid";
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
}> = ({ accounts, transactions }) => {
  const [rows, setRows] = React.useState<Transaction[]>(() => {
    return transactions;
  });

  const [searchText, setSearchText] = React.useState("");
  const requestSearch = (searchValue: string) => {
    setSearchText(searchValue);
    const searchRegex = new RegExp(escapeRegExp(searchValue), "i");
    const filteredRows = transactions.filter((row: any) => {
      return Object.keys(row).some((field: any) => {
        return searchRegex.test(row[field]?.toString());
      });
    });
    setRows(filteredRows);
  };

  React.useEffect(() => {
    setRows(transactions);
  }, [transactions]);

  return (
    <React.Fragment>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ flexGrow: 1 }}>
          <DataGrid
            columns={transactionsGridColumns(accounts)}
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
