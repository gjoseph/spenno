import { Badge } from "@mui/material";
import * as React from "react";

// subset of Badge#color
type Level = "error" | "info" | "success" | "warning";

export const withDotBadge =
  (level: Level) =>
  <P,>(WrappedComponent: React.ComponentType<P>) =>
  (props: P) => {
    return (
      <Badge color={level} variant="dot">
        <WrappedComponent {...props} />
      </Badge>
    );
  };
