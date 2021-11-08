import { Box, Slider, ToggleButton, ToggleButtonGroup } from "@mui/material";
import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import TuneIcon from "@mui/icons-material/Tune";
import * as React from "react";
import { AmountFilter } from "../../util/util";

export type AmountPickerProps = {
  amountFilter: AmountFilter;
  setAmountFilter: (func: (prev: AmountFilter) => AmountFilter) => void;
};
export const AmountPicker: React.FC<
  AmountPickerProps & { min: number; max: number }
> = (props) => {
  const [sliderRange, setSliderRange] = React.useState<number[]>(
    props.amountFilter as number[]
  ); // TODO yikes
  const [radioValue, setRadioValue] = React.useState<string | null>(null);
  const [sliderEnabled, setSliderEnabled] = React.useState<boolean>(true);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setSliderRange(newValue as number[]);
    // TODO enforce array-of-2? and/or have a different state for slider
    // TODO stagger?
    props.setAmountFilter(() => newValue as AmountFilter);
  };

  const handleToggleChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string | null
  ) => {
    setRadioValue(newValue);
    if (newValue === "slider") {
      setSliderEnabled(true);
    } else {
      setSliderEnabled(false);
    }
    props.setAmountFilter(() =>
      newValue !== null ? (newValue as AmountFilter) : "#noFilter"
    );
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
        // getAriaLabel={() => 'Temperature range'}
        // getAriaValueText={valuetext}
        value={sliderRange}
        min={props.min}
        max={props.max}
        onChange={handleSliderChange}
        valueLabelDisplay="on"
        disableSwap={true}
        disabled={!sliderEnabled}
      />
    </Box>
  );
};
