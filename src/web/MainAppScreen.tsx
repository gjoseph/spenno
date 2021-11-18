import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import * as React from "react";
import { Bank } from "../domain/accounts";
import { FileDescriptor, FileWithRawRecords } from "../domain/file";
import { isUncategorised, Transaction } from "../domain/transaction";
import { getChartsFor } from "../domain/charting";
import { ChartWrapper } from "./ChartWrapper";
import { AddFile, FileDrop } from "./FileDrop";
import { FileList, FileToggleCallback } from "./FileList";
import { TabbedPanels, TabPanel } from "./layout/TabbedPanels";
import { RawRecordsTable } from "./table/RawRecordsTable";
import { TransactionsTable } from "./table/TransactionsTable";
import {
  TransactionFilters,
  TransactionFiltersProps,
} from "./TransactionFilters";

export const MainAppScreen: React.FC<
  {
    files: FileDescriptor[];
    addFile: AddFile;
    toggleFile: FileToggleCallback;
    transactions: Transaction[];
    filesWithRawRecords: FileWithRawRecords[];
    accounts: Bank.Accounts;
  } & TransactionFiltersProps
> = (props) => {
  const charts = getChartsFor(
    props.filterConfig.splitBy,
    props.filterConfig.groupBy,
    props.transactions
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
              // TODO fix this up -- we may never have needed a height, but this is starting to look like crap height: 240,
            }}
          >
            <TransactionFilters
              filterConfig={props.filterConfig}
              setFilterConfig={props.setFilterConfig}
              allCategories={props.allCategories}
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
            <Grid container spacing={0}>
              {charts.map((chart, idx) => (
                <ChartWrapper
                  key={idx}
                  type="bar"
                  chart={chart}
                  containerHeight={500 - 70}
                />
              ))}
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, pt: 0, display: "flex", flexDirection: "column" }}>
            {/*TODO: tabs to switch different views (raw, per file, ... or even aggregations? */}
            {/* Some of these tabs could possibly be predefined filters in TransactionsTable/Toolbar instead */}
            <TabbedPanels
              initialTabIdx={0}
              panels={[
                <TabPanel label="Transactions">
                  <TransactionsTable
                    accounts={props.accounts}
                    transactions={props.transactions}
                  />
                </TabPanel>,
                <TabPanel label="Uncategorised transactions">
                  <TransactionsTable
                    accounts={props.accounts}
                    transactions={props.transactions.filter(isUncategorised())}
                  />
                </TabPanel>,
                <TabPanel label="Raw records">
                  <RawRecordsTable
                    filesWithRawRecords={props.filesWithRawRecords}
                    accounts={props.accounts}
                  />
                </TabPanel>,
                <TabPanel label="Etc ...">Item Three</TabPanel>,
              ]}
            />
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
