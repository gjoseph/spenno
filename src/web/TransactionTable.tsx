import * as React from "react";
import { Bank } from "../domain/accounts";
import { Transaction } from "../domain/transaction";
import { DataGridWrapper } from "./table/DataGridWrapper";

import { transactionsGridColumns } from "./table/TransactionsGridColumns";

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
