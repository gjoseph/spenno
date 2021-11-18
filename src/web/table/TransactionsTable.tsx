import * as React from "react";
import { Bank } from "../../domain/accounts";
import { Transaction } from "../../domain/transaction";
import { DataGridWrapper } from "./DataGridWrapper";

import { transactionsGridColumns } from "./TransactionsGridColumns";

export const TransactionsTable: React.FC<{
  accounts: Bank.Accounts;
  transactions: Transaction[];
}> = (props) => {
  return (
    <DataGridWrapper
      columns={transactionsGridColumns(props.accounts)}
      rows={props.transactions}
    />
  );
};
