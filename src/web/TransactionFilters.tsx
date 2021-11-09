import * as React from "react";
import { Category } from "../domain/category";
import { FilterConfig, SetFilterConfig } from "./App";
import { AmountPicker } from "./util-comps/AmountPicker";
import { CategorySelect } from "./util-comps/CategorySelect";
import { PresetTimeframePicker } from "./util-comps/PresetTimeframePicker";

export type TransactionFiltersProps = {
  filterConfig: FilterConfig;
  setFilterConfig: SetFilterConfig;

  // TODO move these to FilterConfig as well? They're more static, don't represent user selection
  allCategories: Category[];
  min: number;
  max: number;
};

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
  filterConfig,
  setFilterConfig,
  allCategories,
  min,
  max,
}) => {
  return (
    <React.Fragment>
      <PresetTimeframePicker
        dateRange={filterConfig.dateRange}
        {...{ setFilterConfig }}
      />
      <CategorySelect {...{ allCategories, setFilterConfig }} />
      <AmountPicker
        amountFilter={filterConfig.amount}
        {...{ min, max, setFilterConfig }}
      />
    </React.Fragment>
  );
};
