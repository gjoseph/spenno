import * as React from "react";
import {
  Cell,
  Pie,
  PieChart as PieReChart,
  ResponsiveContainer,
} from "recharts";
import { ChartDataItem } from "../../domain/charting";
import { ChartColors } from "./ChartColors";

export const PieChart: React.FC<{
  data: ChartDataItem[];
  containerHeight: number;
  halfPieBottom?: boolean;
}> = (props) => {
  // Another fun bug seems to be that if <ResponsiveContainer> is _outside_ this function (i.e in <ChartWrapper> above),
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
            return <Cell key={`cell-${idx}`} fill={ChartColors[idx]} />;
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
