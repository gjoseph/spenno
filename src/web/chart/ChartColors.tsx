import { Color, colors } from "@mui/material";

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
// Get colors from mui ... bit of a hack but oh well
export const ChartColors = Object.values(colors)
  .map((c: any) => (c as Color)["500"])
  .filter((c) => c); // filter undefined 500s, i.e black/white
