import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import * as React from "react";
import { Bank } from "../domain/accounts";
import { getChartsFor } from "../domain/charting";
import { FileDescriptor, FileWithRawRecords } from "../domain/file";
import { Transaction } from "../domain/transaction";
import { uncategorisedStats } from "../domain/uncategorised-stats";
import { ChartWrapper } from "./ChartWrapper";
import { TabbedPanels, TabPanel } from "./layout/TabbedPanels";
import { DataGridWrapper } from "./table/DataGridWrapper";
import { RawRecordsTable } from "./table/RawRecordsTable";
import { mostCommonDescriptionsColumns } from "./table/StatsGridColumns";
import { TransactionsTable } from "./table/TransactionsTable";
import { TransactionFiltersProps } from "./TransactionFilters";

export const MainAppScreen: React.FC<
  {
    files: FileDescriptor[];
    transactions: Transaction[];
    filesWithRawRecords: FileWithRawRecords[];
    accounts: Bank.Accounts;
  } & TransactionFiltersProps
> = (props) => {
  // TODO should these be useEffect()?
  const charts = getChartsFor(
    props.filterConfig.splitBy,
    props.filterConfig.groupBy,
    props.transactions,
  );
  const uncategorised = uncategorisedStats(props.transactions, 100);

  return (
    <React.Fragment>
      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12}>
          <Paper sx={{ p: 2, pt: 0 }}>
            {/* Some of these tabs could possibly be predefined filters in TransactionsTable/Toolbar instead */}
            <TabbedPanels
              initialTabIdx={0}
              panels={[
                <TabPanel label="Graphs" key="Graphs_tab">
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
                <TabPanel label="Transactions" key="Transactions_tab">
                  <TransactionsTable
                    accounts={props.accounts}
                    transactions={props.transactions}
                  />
                </TabPanel>,
                <TabPanel
                  label="Uncategorised"
                  key="Uncategorised_tab"
                  warning={
                    uncategorised.uncategorisedTransactions.length &&
                    `There are ${uncategorised.uncategorisedTransactions.length} uncategorised records`
                  }
                >
                  <TabbedPanels
                    initialTabIdx={0}
                    panels={[
                      <TabPanel label="All" key="All_tab">
                        <TransactionsTable
                          accounts={props.accounts}
                          transactions={uncategorised.uncategorisedTransactions}
                        />
                      </TabPanel>,
                      <TabPanel label="Most common" key="Most_common_tab">
                        <DataGridWrapper
                          columns={mostCommonDescriptionsColumns}
                          rows={uncategorised.mostCommonDescriptions}
                          addIdField
                        />
                      </TabPanel>,
                    ]}
                  />
                </TabPanel>,
                <TabPanel label="Raw records" key="Raw_records_tab">
                  <RawRecordsTable
                    filesWithRawRecords={props.filesWithRawRecords}
                    accounts={props.accounts}
                  />
                </TabPanel>,
                <TabPanel
                  label="Duplicates"
                  key="Duplicates_tab"
                  tooltip={
                    "(TODO)Use this tab to find overlapping/duplicate records in CSV files"
                    // TODO also highlight this when there _are_ duplicate records
                  }
                >
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
