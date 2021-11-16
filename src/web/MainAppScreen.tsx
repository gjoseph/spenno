import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import * as React from "react";
import { Bank } from "../domain/accounts";
import { FileDescriptor } from "../domain/file";
import { RawRecordFilters } from "../domain/filters";
import { isUncategorised, sum, Transaction } from "../domain/transaction";
import { groupBy } from "../util/reducers";
import { zer0 } from "../util/util";
import { GroupByFunctions } from "./App";
import { Chart, ChartDataItem } from "./Chart";
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
  const chartDataGroupedBy = (transactions: Transaction[]): ChartDataItem[] => {
    const groupByFunction = GroupByFunctions[props.filterConfig.groupBy];
    return transactions
      .reduce(...groupBy(groupByFunction))
      .toArray()
      .map((e) => {
        return {
          name: e.key,
          value: e.value.reduce(sum, zer0).abs().toNumber(),
        };
      });
  };

  const charts: { title: string; data: ChartDataItem[] }[] = [
    {
      title: "Credits",
      data: chartDataGroupedBy(
        props.transactions.filter(RawRecordFilters.isCredit())
      ),
    },
    {
      title: "Debits",
      data: chartDataGroupedBy(
        props.transactions.filter(RawRecordFilters.isDebit())
      ),
    },
  ];

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
                <Chart
                  title={chart.title}
                  data={chart.data}
                  containerHeight={500 - 70}
                />
              ))}
            </Grid>
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
