import { Box, Slider, ToggleButton, ToggleButtonGroup } from "@mui/material";
import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import TuneIcon from "@mui/icons-material/Tune";
import * as React from "react";
import { AmountFilter, AmountFilterType, AmountRange } from "../../util/util";

export type AmountPickerProps = {
  amountFilter: AmountFilter;
  setAmountFilter: (func: (prev: AmountFilter) => AmountFilter) => void;
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

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setSliderRange(newValue as AmountRange);
    // TODO enforce array-of-2? and/or have a different state for slider
    // TODO stagger?
    props.setAmountFilter((prev) => ({
      ...prev,
      range: newValue as AmountRange,
    }));
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
    props.setAmountFilter((prev) => {
      console.log("prevValue:", prev);
      console.log("newValue:", newValue);
      const type = newValue as AmountFilterType;
      return { ...prev, type: type };
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
        valueLabelDisplay="on"
        disableSwap={true}
        disabled={!sliderEnabled}
      />
    </Box>
  );
};
