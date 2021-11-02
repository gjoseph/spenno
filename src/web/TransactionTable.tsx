import Big from "big.js";
import { Moment } from "moment";
import * as React from "react";
import Link from "@mui/material/Link";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Bank } from "../domain/accounts";
import { Category } from "../domain/category";
import { Transaction } from "../domain/transaction";

function preventDefault(event: React.MouseEvent) {
  event.preventDefault();
}

const AccountView: React.FC<{ account: Bank.Account }> = ({ account }) => {
  return <React.Fragment>{account.name}</React.Fragment>;
};
const CategoryView: React.FC<{ category: Category }> = ({ category }) => {
  return <React.Fragment>{category}</React.Fragment>;
};
const DateView: React.FC<{ date: Moment }> = ({ date }) => {
  return <React.Fragment>{date.format("L")}</React.Fragment>;
};
const AmountView: React.FC<{ amount: Big }> = ({ amount }) => {
  // negative for a debit, positive for a credit
  return (
    <span className={amount.lt(0) ? "amount-debit" : "amount-credit"}>
      ${amount.toString()}
    </span>
  );
};

export const TransactionTable: React.FC<{
  accounts: Bank.Accounts;
  transactions: Transaction[];
}> = ({ accounts, transactions }) => {
  return (
    <React.Fragment>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Account</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Merchant</TableCell>
            <TableCell align="right">Amount</TableCell>
            <TableCell>Category</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <AccountView account={row.account} />
              </TableCell>
              <TableCell>
                <DateView date={row.date} />
              </TableCell>
              <TableCell>{row.desc}</TableCell>
              <TableCell>{row.merchant}</TableCell>
              <TableCell align="right">
                <AmountView amount={row.amount} />
              </TableCell>
              <TableCell>
                <CategoryView category={row.category} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Link color="primary" href="#" onClick={preventDefault} sx={{ mt: 3 }}>
        See more records
      </Link>
    </React.Fragment>
  );
};
