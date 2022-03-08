import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import * as React from "react";
import { Category } from "../domain/category";
import { FilterConfig, SetFilterConfig } from "./App";
import { AmountPicker } from "./config/AmountPicker";
import { CategorySelect } from "./config/CategorySelect";
import { GroupByToggle } from "./config/GroupByToggle";
import { PresetTimeframePicker } from "./config/PresetTimeframePicker";

export type TransactionFiltersProps = {
  filterConfig: FilterConfig;
  setFilterConfig: SetFilterConfig;

  // TODO move these to FilterConfig as well? They're more static, don't represent user selection
  allCategories: Category[];
  min: number;
  max: number;
};

/**
 * Filter by:
 *   - time filters (radio-year, time-span, a few  predefined "since", a few predefined "last period")
 *   - category filters (dropdown with checkbox, search, "all")
 *   - category depth (maybe pie charts can do this automatically with surrounding pies, see e.g https://recharts.org/en-US/examples/TwoLevelPieChart)
 *   - amount filters
 *   - include unknowns
 *   - include credits (implied if split-by-credit-vs-debit, acceptable if using bar charts across axis..)
 * Split by: same criteria, generate multiple graphs
 * Group by: in each graph, which criteria generates a different pie piece
 * Time series graphs?
 * Other toggles:
 * - 2 pie charts (one spend one income) or bar charts (which should support positive and negative on same chart)
 * - merge credit and debit (e.g health could have both)
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
      <FormControl component="fieldset">
        <FormLabel component="legend">Time frame</FormLabel>
        <PresetTimeframePicker
          dateRange={filterConfig.dateRange}
          {...{ setFilterConfig }}
        />
        [all]
      </FormControl>
      <FormControl component="fieldset">
        <FormLabel component="legend">Categories</FormLabel>
        <FormLabel htmlFor="depth-select">Depth</FormLabel>
        {/* or a Slider or a ToggleButtonGroup...*/}
        <RadioGroup row name="depth-select">
          <FormControlLabel value="1" control={<Radio />} label="1" />
          <FormControlLabel value="2" control={<Radio />} label="2" />
          <FormControlLabel value="3" control={<Radio />} label="3" />
        </RadioGroup>
        depth should then influence the list displayed here:
        <CategorySelect
          selectedCategories={filterConfig.categories}
          {...{ allCategories, setFilterConfig }}
        />
        [select all], [deselect all]
      </FormControl>
      <FormControl component="fieldset">
        <FormLabel component="legend">Amount filter</FormLabel>
        <AmountPicker
          amountFilter={filterConfig.amount}
          {...{ min, max, setFilterConfig }}
        />
      </FormControl>
      <FormControl component="fieldset">
        <FormLabel component="legend">Group by</FormLabel>
        <GroupByToggle
          value={filterConfig.groupBy}
          updateFilterConfig={(newValue) =>
            setFilterConfig((prev) => ({ ...prev, groupBy: newValue }))
          }
        />
      </FormControl>
      <FormControl component="fieldset">
        <FormLabel component="legend">Split by</FormLabel>
        <p>
          Split by: (when splitting by year, a pie chart will make no sense of
          positive _and_ negative numbers
        </p>
        <GroupByToggle
          value={filterConfig.splitBy}
          updateFilterConfig={(newValue) =>
            setFilterConfig((prev) => ({ ...prev, splitBy: newValue }))
          }
        />
      </FormControl>
    </React.Fragment>
  );
};
