import { Color, colors, Grid } from "@mui/material";
import * as React from "react";
import {
  Cell,
  Pie,
  PieChart as PieReChart,
  ResponsiveContainer,
} from "recharts";
import { Title } from "./layout/Title";

export type ChartDesc = { title: string; data: ChartDataItem[] };
export type ChartDataItem = { name: string; value: number };
export const Chart: React.FC<{
  chart: ChartDesc;
  containerHeight: number;
}> = ({ chart, containerHeight }) => {
  return (
    <Grid item xs>
      <Title>{chart.title}</Title>
      {/*there seems to be a weird bug between <Grid> and <ResponsiveContainer> where when the latter's height*/}
      {/*is set to 100%, it creates an infinitely increasing height. So instead of fiddling around more, I'm just*/}
      {/*passing the height from the parent component, which already has it hardcoded*/}
      {/*Maybe related to https://stackoverflow.com/questions/50891591/recharts-responsive-container-does-not-resize-correctly-in-flexbox*/}
      {/*and https://github.com/recharts/recharts/issues/172*/}
      <PieChart data={chart.data} containerHeight={containerHeight} />
    </Grid>
  );
};

const PieChart: React.FC<{
  data: ChartDataItem[];
  containerHeight: number;
  halfPieBottom?: boolean;
}> = (props) => {
  // Another fun bug seems to be that if <ResponsiveContainer> is _outside_ this function (i.e in <Chart> above),
  // then it doesn't work, the chart doesn't render at all
  return (
    <ResponsiveContainer width="100%" height={props.containerHeight}>
      <PieReChart>
        <Pie
          data={props.data}
          dataKey="value"
          label={labelValue}
          startAngle={180}
          endAngle={props.halfPieBottom ? 0 : -180}
          // Since we have "half pies", align them to the bottom:
          cy={props.halfPieBottom ? "100%" : "50%"}
        >
          {props.data.map((d, idx) => {
            return <Cell key={`cell-${idx}`} fill={COLORS[idx]} />;
          })}
        </Pie>
      </PieReChart>
    </ResponsiveContainer>
  );
};

const labelValue: ({ name, value }: { name: string; value: string }) => string =
  ({ name, value }) => {
    return `${name} (${value})`;
  };

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
// Get colors from mui ... bit of a hack but oh well
const COLORS = Object.values(colors)
  .map((c: any) => (c as Color)["500"])
  .filter((c) => c); // filter undefined 500s, i.e black/white
