import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import * as React from "react";

export const Copyright: React.FC = () => (
  <Typography
    variant="body2"
    color="text.secondary"
    align="center"
    sx={{ pt: 4 }}
  >
    {"Copyright © "}
    <Link color="inherit" href="#">
      Some Bull Shit
    </Link>{" "}
    {" " + new Date().getFullYear() + "."}
  </Typography>
);
