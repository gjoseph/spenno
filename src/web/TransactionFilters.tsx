import * as React from "react";
import { AmountPicker, AmountPickerProps } from "./util-comps/AmountPicker";
import {
  CategorySelect,
  CategorySelectProps,
} from "./util-comps/CategorySelect";
import {
  PresetTimeframePicker,
  PresetTimeframePickerProps,
} from "./util-comps/PresetTimeframePicker";

type TransactionFiltersProps = PresetTimeframePickerProps &
  CategorySelectProps &
  AmountPickerProps;

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
export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  dateRange,
  setDateRange,
  allCategories,
  setCategories,
  amountFilter,
  setAmountFilter,
}) => {
  return (
    <React.Fragment>
      <PresetTimeframePicker {...{ dateRange, setDateRange }} />
      <CategorySelect {...{ allCategories, setCategories }} />
      <AmountPicker
        min={-10000}
        max={10000}
        {...{ amountFilter, setAmountFilter }}
      />
    </React.Fragment>
  );
};
