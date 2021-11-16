import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import TuneIcon from "@mui/icons-material/Tune";
import { Box, Slider, ToggleButton, ToggleButtonGroup } from "@mui/material";
import * as React from "react";
import { AmountFilter, AmountFilterType, AmountRange } from "../../util/util";
import { SetFilterConfig } from "../App";

export type AmountPickerProps = {
  amountFilter: AmountFilter;
  setFilterConfig: SetFilterConfig;
  min: number;
  max: number;
};

// log scales not really useful
// const log = (x:number) => Math.log(x) ;
// const log10 = (x:number) => Math.log(x) / Math.log(10);
const marks = [
  -100_000, -10_000, -1_000, -100, -10, 0, 10, 100, 1_000, 10_000, 100_000,
].map((n) => ({ value: n, label: n.toString() }));

export const AmountPicker: React.FC<AmountPickerProps> = (props) => {
  const [sliderRange, setSliderRange] = React.useState<AmountRange>(() => {
    console.log("props.amountFilter:", props.amountFilter);
    return props.amountFilter.range || [props.min, props.max];
  }); // TODO yikes

  const [radioValue, setRadioValue] = React.useState<AmountFilterType | null>(
    null
  );
  const [sliderEnabled, setSliderEnabled] = React.useState<boolean>(false);

  // Keep state up-to-date when slider is being dragged
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setSliderRange(newValue as AmountRange);
  };

  // Commit to config when slider handle is released
  const handleSliderCommit = (
    event: React.SyntheticEvent | Event,
    newValue: number | number[]
  ) => {
    // TODO enforce array-of-2? and/or have a different state for slider
    props.setFilterConfig((prev) => {
      return {
        ...prev,
        amount: { ...prev.amount, range: newValue as AmountRange },
      };
    });
  };

  const handleToggleChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string | null
  ) => {
    setRadioValue(newValue as AmountFilterType);
    if (newValue === "slider") {
      setSliderEnabled(true);
    } else {
      setSliderEnabled(false);
    }
    props.setFilterConfig((prev) => {
      return {
        ...prev,
        amount: { ...prev.amount, type: newValue as AmountFilterType },
      };
    });
  };
  return (
    <Box>
      <ToggleButtonGroup
        value={radioValue}
        onChange={handleToggleChange}
        exclusive
      >
        <ToggleButton value="debitOnly" aria-label="Debit only">
          <ArrowCircleDownIcon /> debit only
        </ToggleButton>
        <ToggleButton value="creditOnly" aria-label="Credit only">
          <ArrowCircleUpIcon /> credit only
        </ToggleButton>
        <ToggleButton value="slider" aria-label="Custom range">
          <TuneIcon />
        </ToggleButton>
      </ToggleButtonGroup>
      <Slider
        // getAriaLabel={() => 'Amount range'}
        // getAriaValueText={valuetext}
        value={sliderRange}
        min={props.min}
        max={props.max}
        marks={marks}
        onChange={handleSliderChange}
        onChangeCommitted={handleSliderCommit}
        valueLabelDisplay="on"
        disableSwap={true}
        disabled={!sliderEnabled}
      />
    </Box>
  );
};
