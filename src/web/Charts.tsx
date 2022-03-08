import { FormControl, FormLabel } from "@mui/material";
import Grid from "@mui/material/Grid";
import * as React from "react";
import { ChartDesc, getChartsFor, GroupBy, SplitBy } from "../domain/charting";
import { Transaction } from "../domain/transaction";
import { ChartWrapper } from "./ChartWrapper";
import { GroupByToggle } from "./config/GroupByToggle";

type ChartsProps = {
  transactions: Transaction[];
};
export const Charts: React.FC<ChartsProps> = (props) => {
  const [splitBy, setSplitBy] = React.useState<SplitBy>("year");
  const [groupBy, setGroupBy] = React.useState<GroupBy>("category");

  const charts = React.useMemo<ChartDesc[]>(() => {
    return getChartsFor(splitBy, groupBy, props.transactions);
  }, [splitBy, groupBy]);

  return (
    <Grid container>
      <Grid item>
        <FormControl component="fieldset">
          <FormLabel component="legend">Group by</FormLabel>
          <GroupByToggle value={groupBy} updateConfig={setGroupBy} />
        </FormControl>
        <FormControl component="fieldset">
          <FormLabel component="legend">Split by</FormLabel>
          <p>
            Split by: (when splitting by year, a pie chart will make no sense of
            positive _and_ negative numbers
          </p>
          <GroupByToggle value={splitBy} updateConfig={setSplitBy} />
        </FormControl>
      </Grid>
      <Grid item>
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
      </Grid>
    </Grid>
  );
};
