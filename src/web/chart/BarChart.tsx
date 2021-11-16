import * as React from "react";
import {
  Bar,
  BarChart as BarReChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartDataItem } from "../ChartWrapper";

export const BarChart: React.FC<{
  data: ChartDataItem[];
  containerHeight: number;
}> = (props) => {
  return (
    <ResponsiveContainer width="100%" height={props.containerHeight}>
      <BarReChart data={props.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarReChart>
    </ResponsiveContainer>
  );
};
