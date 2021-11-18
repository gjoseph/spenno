import { Backdrop, CircularProgress, LinearProgress } from "@mui/material";
import * as React from "react";

export const ProgressIndicator: React.FC<{
  inProgress: boolean;
  dramatic?: boolean;
}> = (props) => {
  return props.dramatic ? (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={props.inProgress}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  ) : props.inProgress ? (
    <LinearProgress variant="indeterminate" color="info" />
  ) : null;
};
