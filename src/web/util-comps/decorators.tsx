import { Badge } from "@mui/material";
import React, { ComponentType } from "react";

// subset of Badge#color
type Level = "error" | "info" | "success" | "warning";

export const withDotBadge =
  (level: Level) =>
  <P,>(WrappedComponent: ComponentType<P>) =>
  // eslint-disable-next-line react/display-name
  (props: P & JSX.IntrinsicAttributes) => {
    return (
      <Badge color={level} variant="dot">
        <WrappedComponent {...props} />
      </Badge>
    );
  };
