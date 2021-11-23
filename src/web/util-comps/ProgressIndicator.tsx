import { Backdrop, CircularProgress, LinearProgress } from "@mui/material";
import * as React from "react";

export const ProgressIndicator: React.FC<{
  inProgress: boolean;
  type: "withBackdrop" | "small" | "line";
}> = (props) => {
  if (!props.inProgress) {
    return null;
  }
  switch (props.type) {
    case "withBackdrop":
      return (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={props.inProgress}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      );

    case "small":
      return <CircularProgress color="inherit" />;

    default:
      return <LinearProgress variant="indeterminate" color="info" />;
  }
};
