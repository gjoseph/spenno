import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import * as React from "react";
import { DateRange } from "../../domain/transaction";
import moment from "moment";

// N period ago
// Since beginning of N period ago
// Exact date to now
// Exact date range

type PresetTimeframePickerProps = {
  dateRange: DateRange;
  setDateRange: (func: (prev: DateRange) => DateRange) => void;
};
export const PresetTimeframePicker: React.FC<PresetTimeframePickerProps> = (
  props
) => {
  // array if non-exclusive, string if exclusive
  const [value, setValue] = React.useState<number[]>([]);

  const selectYear = (
    event: React.MouseEvent<HTMLElement>,
    selectedYears: number[]
  ) => {
    selectedYears = selectedYears.sort();
    setValue(selectedYears);
    // TODO not quite correct since we're not enforcing a continuous date range...
    const y1 = selectedYears[0];
    const y2 = selectedYears[selectedYears.length - 1];
    const m1 = moment().year(y1).startOf("year");
    const m2 = moment().year(y2).endOf("year");
    props.setDateRange((prev) => [m1, m2]);
  };

  return (
    <React.Fragment>
      <ToggleButtonGroup value={value} onChange={selectYear}>
        {[2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022].map((year) => (
          <ToggleButton key={year} value={year}>
            {year}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </React.Fragment>
  );
};
