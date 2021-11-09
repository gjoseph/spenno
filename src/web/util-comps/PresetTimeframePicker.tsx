import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import * as React from "react";
import {
  ALL_YEARS,
  DateRange,
  endOfYear,
  startOfYear,
} from "../../util/time-util";
import { SetFilterConfig } from "../App";

// N period ago
// Since beginning of N period ago
// Exact date to now
// Exact date range

export type PresetTimeframePickerProps = {
  dateRange: DateRange;
  setFilterConfig: SetFilterConfig;
};
export const PresetTimeframePicker: React.FC<PresetTimeframePickerProps> = (
  props
) => {
  // array if non-exclusive, string if exclusive
  const [value, setValue] = React.useState<number[]>(() => {
    const yearStart = props.dateRange[0]?.year() || ALL_YEARS[0];
    const yearEnd =
      props.dateRange[1]?.year() || ALL_YEARS[ALL_YEARS.length - 1];
    return ALL_YEARS.filter((y) => {
      return y >= yearStart && y <= yearEnd;
    });
  });

  const selectYear = (
    event: React.MouseEvent<HTMLElement>,
    selectedYears: number[]
  ) => {
    selectedYears = selectedYears.sort();
    setValue(selectedYears);
    // TODO not quite correct since we're not enforcing a continuous date range...
    const y1 = selectedYears[0];
    const y2 = selectedYears[selectedYears.length - 1];
    const m1 = startOfYear(y1);
    const m2 = endOfYear(y2);
    const dateRange: DateRange = [m1, m2];
    props.setFilterConfig((prev) => ({ ...prev, dateRange }));
  };

  return (
    <React.Fragment>
      <ToggleButtonGroup value={value} onChange={selectYear}>
        {ALL_YEARS.map((year) => (
          <ToggleButton key={year} value={year}>
            {year}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </React.Fragment>
  );
};
