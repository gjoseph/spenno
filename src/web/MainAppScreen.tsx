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
      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={9}>
          <Paper
            sx={{
              p: 2,
              height: "100%", // combined with alignItems="stretch", i _think_ we ensure these 2 grid items have the same height
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
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2,
              height: "100%",
            }}
          >
            <FileDrop addFile={props.addFile}>
              <FileList files={props.files} toggleFile={props.toggleFile} />
            </FileDrop>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, pt: 0 }}>
            {/*TODO: Other tabs to show aggregations ? */}
            {/* Some of these tabs could possibly be predefined filters in TransactionsTable/Toolbar instead */}
            <TabbedPanels
              initialTabIdx={0}
              panels={[
                <TabPanel label="Graphs">
                  <Grid container spacing={0}>
                    {charts.map((chart, idx) => (
                      <Grid item xs={12} md={6} xl={4} key={idx}>
                        <ChartWrapper
                          type="bar"
                          chart={chart}
                          containerHeight={500 - 70}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </TabPanel>,
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
              ]}
            />
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
