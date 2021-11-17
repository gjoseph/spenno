import { DataGrid } from "@mui/x-data-grid";
import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import { Bank } from "../domain/accounts";
import { Transaction } from "../domain/transaction";
import { QuickSearchToolbar } from "./table/QuickSearchToolbar";

import { TRANSACTIONS_GRID_COLUMNS } from "./table/TransactionsGridColumns";

// TODO this is not the right place to do this, a stable ID should be gen'd somewhere else?
const transactionsWithId = (transactions: Transaction[]) => {
  // TODO this is not the right place to do this, a stable ID should be gen'd somewhere else?
  return transactions.map((t) => ({
    id: uuidv4(),
    ...t,
  }));
};

const escapeRegExp = (value: string): string => {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

type TransactionRow = { id: string } & Transaction;
export const TransactionTable: React.FC<{
  accounts: Bank.Accounts;
  transactions: Transaction[];
}> = ({ accounts, transactions }) => {
  const [rows, setRows] = React.useState<TransactionRow[]>(() => {
    return transactionsWithId(transactions);
  });

  const [searchText, setSearchText] = React.useState("");
  const requestSearch = (searchValue: string) => {
    setSearchText(searchValue);
    const searchRegex = new RegExp(escapeRegExp(searchValue), "i");
    const filteredRows = transactions.filter((row: any) => {
      return Object.keys(row).some((field: any) => {
        console.log("row:", row);
        console.log("field:", field);
        return searchRegex.test(row[field]?.toString());
      });
    });
    setRows(transactionsWithId(filteredRows));
  };

  React.useEffect(() => {
    setRows(transactionsWithId(transactions));
  }, [transactions]);

  return (
    <React.Fragment>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ flexGrow: 1 }}>
          <DataGrid
            rows={rows}
            columns={TRANSACTIONS_GRID_COLUMNS}
            pageSize={100}
            // rowsPerPageOptions={[5, 100, 500]}
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
