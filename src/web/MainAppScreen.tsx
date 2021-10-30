import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import * as React from "react";
import { Bank } from "../domain/accounts";
import { TransactionsFile } from "../domain/file";
import {
  DateRange,
  isUncategorised,
  sum,
  Transaction,
} from "../domain/transaction";
import { RawRecordFilters } from "../domain/filters";
import { groupBy } from "../util/reducers";
import { zer0 } from "../util/util";
import { Chart } from "./Chart";
import { FileDrop } from "./FileDrop";
import { FileList } from "./FileList";
import { TabPanel, TabbedPanels } from "./layout/TabbedPanels";
import { TransactionTable } from "./TransactionTable";
import { PresetTimeframePicker } from "./util-comps/PresetTimeframePicker";

export const MainAppScreen: React.FC<{
  files: TransactionsFile[];
  setFiles: (
    func: (prevState: TransactionsFile[]) => TransactionsFile[]
  ) => void;
  transactions: Transaction[];
  accounts: Bank.Accounts;

  dateRange: DateRange;
  setDateRange: (func: (prev: DateRange) => DateRange) => void;
}> = (props) => {
  const addFile = (f: TransactionsFile) => {
    props.setFiles((prevValue) => {
      prevValue.push(f);
      return prevValue.slice();
    });
  };

  const toggleFile = (fileId: string, enabled: boolean) => {
    props.setFiles((prevValue) => {
      const transactionsFile = prevValue.find((f) => f.id === fileId);
      if (!transactionsFile) {
        throw new Error("File with id " + fileId + " not found!?");
      }
      transactionsFile.enabled = enabled;
      return prevValue.slice();
    });
  };

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
            {/*
              * time filters (radio-year, time-span, a few  predefined "since", a few predefined "last period")
              * category filters (dropdown with checkbox, search, "all")
              * category depth (maybe pie charts can do this automatically with surrounding pies, see e.g https://recharts.org/en-US/examples/TwoLevelPieChart)
              * amount filters
              - split by: same criteria, generate multiple graphs
              - group by: in each graph, which criteria generates a different pie piece
              * time series graphs?
            Other toggles
              * 2 pie charts (one spend one income) or bar charts (which should support positive and negative on same chart)
              * merge credit and debit (e.g health could have both)
            */}
            <PresetTimeframePicker
              dateRange={props.dateRange}
              setDateRange={props.setDateRange}
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
            <FileDrop addFile={addFile}>
              <FileList files={props.files} toggleFile={toggleFile} />
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
                  transactions={props.transactions.filter(isUncategorised)}
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
