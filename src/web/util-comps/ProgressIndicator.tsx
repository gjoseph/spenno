import { LinearProgress } from "@mui/material";
import * as React from "react";

export const ProgressIndicator: React.FC<{ inProgress: boolean }> = (props) => {
  return props.inProgress ? (
    <LinearProgress variant="indeterminate" color="secondary" />
  ) : null;
};
