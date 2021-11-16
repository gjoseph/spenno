import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import * as React from "react";
import { Bank } from "../domain/accounts";
import { FileDescriptor } from "../domain/file";
import { RawRecordFilters } from "../domain/filters";
import { isUncategorised, sum, Transaction } from "../domain/transaction";
import { groupBy } from "../util/reducers";
import { ALL_YEARS } from "../util/time-util";
import { zer0 } from "../util/util";
import { GroupBy, GroupByFunctions, SplitBy } from "./App";
import { Chart, ChartDataItem, ChartDesc } from "./Chart";
import { AddFile, FileDrop } from "./FileDrop";
import { FileList, FileToggleCallback } from "./FileList";
import { TabbedPanels, TabPanel } from "./layout/TabbedPanels";
import {
  TransactionFilters,
  TransactionFiltersProps,
} from "./TransactionFilters";
import { TransactionTable } from "./TransactionTable";

const chartDataGroupedBy = (
  transactions: Transaction[],
  whatToGroupBy: GroupBy
): ChartDataItem[] => {
  const groupByFunction = GroupByFunctions[whatToGroupBy];
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

type TransactionFilter = (t: Transaction) => boolean;
const makeChart = (
  title: string,
  predicate: TransactionFilter,
  whatToGroupBy: GroupBy,
  transactions: Transaction[]
): ChartDesc => ({
  title,
  data: chartDataGroupedBy(transactions.filter(predicate), whatToGroupBy),
});

type ChartMakerSauce = { title: string; predicate: TransactionFilter };

const makeCharts: (sauce: ChartMakerSauce[]) => ChartMaker = (
  sauce: ChartMakerSauce[]
) => {
  return (whatToGroupBy: GroupBy, transactions: Transaction[]) =>
    sauce.map((x) => {
      return makeChart(x.title, x.predicate, whatToGroupBy, transactions);
    });
};

type ChartMaker = (
  whatToGroupBy: GroupBy,
  transactions: Transaction[]
) => ChartDesc[];

export const SplitByFunctions: Record<SplitBy, () => ChartMaker> = {
  amount: () =>
    makeCharts([
      { title: "Credits", predicate: RawRecordFilters.isCredit() },
      {
        title: "Debits",
        predicate: RawRecordFilters.isDebit(),
      },
    ]),
  year: () =>
    makeCharts(
      // TODO actually we can reimplement this with a groupBy
      ALL_YEARS.map((y) => ({
        title: y.toString(),
        predicate: (t) => t.date.year() === y,
      }))
    ),
  category: () => {
    throw new Error("Split by category is not implemented yet!");
  },
  account: () => {
    return (whatToGroupBy: GroupBy, transactions: Transaction[]) => {
      const map = transactions.reduce(...groupBy(GroupByFunctions["account"]));
      return map.toArray().map((e: { key: string; value: Transaction[] }) => {
        // predicate shoulndn't be required here, `value` is already filtered via the first groupBy
        return makeChart(e.key, (t) => true, whatToGroupBy, e.value);
      });
    };
  },
};

// TODO we should do this in the webworker
const getChartsFor = (
  whatToSplitBy: SplitBy,
  whatToGroupBy: GroupBy,
  transactions: Transaction[]
) => {
  const chartMaker = SplitByFunctions[whatToSplitBy]();
  return chartMaker(whatToGroupBy, transactions);
};

export const MainAppScreen: React.FC<
  {
    files: FileDescriptor[];
    addFile: AddFile;
    toggleFile: FileToggleCallback;
    transactions: Transaction[];
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
                <Chart key={idx} chart={chart} containerHeight={500 - 70} />
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
