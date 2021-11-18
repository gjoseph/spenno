import SettingsIcon from "@mui/icons-material/Settings";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { AppBar, Button, ButtonGroup } from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import * as React from "react";

export const TopBar: React.FC<{}> = (props) => {
  return (
    <React.Fragment>
      <AppBar position="absolute">
        <Toolbar
          sx={{
            pr: "24px", // keep right padding when drawer closed
          }}
        >
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
            {/*IconButton generates dom/react error logs, looks a bit different*/}
            <Button>
              <SettingsIcon />
            </Button>
            <Button>
              <UploadFileIcon />
            </Button>
          </ButtonGroup>
        </Toolbar>
        {props.children}
      </AppBar>
    </React.Fragment>
  );
};
