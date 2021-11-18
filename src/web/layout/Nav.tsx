import FilterListIcon from "@mui/icons-material/FilterList";
import InfoIcon from "@mui/icons-material/Info";
import SettingsIcon from "@mui/icons-material/Settings";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import {
  AppBar,
  ButtonGroup,
  IconButton as MuiIconButton,
} from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import * as React from "react";

const IconButton: React.FC<{ icon: React.JSXElementConstructor<any> }> = (
  props
) => (
  <MuiIconButton
    size="large"
    edge="start"
    color="inherit"
    aria-label="menu"
    sx={{ ml: 0 }}
  >
    <props.icon />
  </MuiIconButton>
);

export const TopBar: React.FC<{}> = (props) => {
  return (
    <AppBar position="absolute">
      <Toolbar>
        <Typography
          component="h1"
          variant="h6"
          color="inherit"
          noWrap
          sx={{ flexGrow: 1 }}
        >
          Spenno - check da mullah
        </Typography>
        <ButtonGroup color="inherit">
          <IconButton icon={FilterListIcon} />
          <IconButton icon={UploadFileIcon} />
          <IconButton icon={SettingsIcon} />
          <IconButton icon={InfoIcon} />
        </ButtonGroup>
      </Toolbar>
      {props.children}
    </AppBar>
  );
};
