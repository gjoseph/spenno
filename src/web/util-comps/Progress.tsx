import { CircularProgress } from "@mui/material";
import * as React from "react";

export const SimpleProgressIndicator: React.FC<{ inProgress: boolean }> = (
  props
) => {
  return props.inProgress ? <CircularProgress /> : null;
};
