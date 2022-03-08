import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import * as React from "react";

type GroupByToggleProps<T> = {
  value: T;
  // TODO pass possible values as prop?
  updateConfig: (newValue: T) => void;
};
export const GroupByToggle = <T extends any>(props: GroupByToggleProps<T>) => {
  const handleToggleChange = (event: any, newValue: T | null) => {
    if (newValue !== null) {
      props.updateConfig(newValue);
    }
  };
  return (
    <Box>
      <ToggleButtonGroup
        value={props.value}
        onChange={handleToggleChange}
        exclusive
      >
        <ToggleButton value="year">year</ToggleButton>
        <ToggleButton value="category">category</ToggleButton>
        <ToggleButton value="amount">amount</ToggleButton>
        <ToggleButton value="account">account</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
