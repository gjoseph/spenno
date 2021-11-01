import * as React from "react";
import { DateRange } from "../domain/transaction";
import { PresetTimeframePicker } from "./util-comps/PresetTimeframePicker";

interface TransactionFiltersProps {
  dateRange: DateRange;
  setDateRange: (func: (prev: DateRange) => DateRange) => void;
}

/**
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
 */
export const TransactionFilters = (props: TransactionFiltersProps) => {
  return (
    <PresetTimeframePicker
      dateRange={props.dateRange}
      setDateRange={props.setDateRange}
    />
  );
};
