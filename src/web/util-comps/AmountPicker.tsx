import {
  Box,
  Slider, ToggleButton, ToggleButtonGroup
} from "@mui/material";
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import TuneIcon from '@mui/icons-material/Tune';
import * as React from "react";
import { Range,AmountFilter } from "../../util/util";

export const AmountPicker: React.FC<{
  min: number;
  max: number;
  current: AmountFilter; // TODO AmountFilter
}> = (props) => {
  const [range, setRange] = React.useState<AmountFilter>(props.current); // TODO <AmountFilter>
  const [sliderEnabled, setSliderEnabled] = React.useState<boolean>(true);
  const [radioValue, setRadioValue] = React.useState<string | null>(null);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    // TODO enforce array-of-2?
    setRange(newValue as AmountFilter);
    // setRadioValue(() => null);
  };

  const handleToggleChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string | null,
  ) => {
    setRadioValue(newValue);
    if (newValue==="slider") {
      setSliderEnabled(true);
    } else {
      setSliderEnabled(false);
    }
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
        value={typeof range === "string" ?  [0,0]:range as number[]}
        min={props.min}
        max={props.max}
        onChange={handleSliderChange}
        valueLabelDisplay="on"
        disableSwap={true}
        disabled={!sliderEnabled}
      />
      {/*<FormControl component="fieldset">*/}
      {/*  /!*<FormLabel component="legend">Gender</FormLabel>*!/*/}
      {/*  <RadioGroup row value={radioValue} onChange={handleRadioChange}>*/}
      {/*    <FormControlLabel*/}
      {/*      value="debitOnly"*/}
      {/*      control={<Radio />}*/}
      {/*      label="Debit Only"*/}
      {/*    />*/}
      {/*    <FormControlLabel*/}
      {/*      value="creditOnly"*/}
      {/*      control={<Radio />}*/}
      {/*      label="Credit Only"*/}
      {/*    />*/}
      {/*  </RadioGroup>*/}
      {/*</FormControl>*/}
    </Box>
  );
};
