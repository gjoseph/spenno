import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import * as React from "react";
import { Bank } from "../domain/accounts";
import { FileDescriptor } from "../domain/file";
import { RawRecordFilters } from "../domain/filters";
import { isUncategorised, sum, Transaction } from "../domain/transaction";
import { groupBy } from "../util/reducers";
import { zer0 } from "../util/util";
import { Chart } from "./Chart";
import { AddFile, FileDrop } from "./FileDrop";
import { FileList, FileToggleCallback } from "./FileList";
import { TabbedPanels, TabPanel } from "./layout/TabbedPanels";
import {
  TransactionFilters,
  TransactionFiltersProps,
} from "./TransactionFilters";
import { TransactionTable } from "./TransactionTable";

export const MainAppScreen: React.FC<
  {
    files: FileDescriptor[];
    addFile: AddFile;
    toggleFile: FileToggleCallback;
    transactions: Transaction[];
    accounts: Bank.Accounts;
  } & TransactionFiltersProps
> = (props) => {
  function totalByCategoryFor(transactions: Transaction[]) {
    return transactions
      .reduce(...groupBy((t: Transaction) => t.category))
      .toArray()
      .map((e) => {
        return {
          name: e.key,
          value: e.value.reduce(sum, zer0).abs().toNumber(),
        };
      });
  }

  const creditsByCategory = totalByCategoryFor(
    props.transactions.filter(RawRecordFilters.isCredit())
  );
  const debitsByCategory = totalByCategoryFor(
    props.transactions.filter(RawRecordFilters.isDebit())
  );

  return (
    <React.Fragment>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={9}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 240,
            }}
          >
            <TransactionFilters
              dateRange={props.dateRange}
              setDateRange={props.setDateRange}
              allCategories={props.allCategories}
              setCategories={props.setCategories}
              amountFilter={props.amountFilter}
              setAmountFilter={props.setAmountFilter}
              min={props.min}
              max={props.max}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: 240,
            }}
          >
            <FileDrop addFile={props.addFile}>
              <FileList files={props.files} toggleFile={props.toggleFile} />
            </FileDrop>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 500 }}
          >
            <Chart
              credits={creditsByCategory}
              debits={debitsByCategory}
              containerHeight={500 - 70}
            />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, pt: 0, display: "flex", flexDirection: "column" }}>
            {/*TODO: tabs to switch different views (raw, per file, ... or even aggregations? */}
            <TabbedPanels>
              <TabPanel label="All Transactions">
                <TransactionTable
                  accounts={props.accounts}
                  transactions={props.transactions}
                />
              </TabPanel>
              <TabPanel label="Uncategorised transactions">
                <TransactionTable
                  accounts={props.accounts}
                  transactions={props.transactions.filter(isUncategorised())}
                />
              </TabPanel>
              <TabPanel label="Raw records">Item Two</TabPanel>
              <TabPanel label="Etc ...">Item Three</TabPanel>
            </TabbedPanels>
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
