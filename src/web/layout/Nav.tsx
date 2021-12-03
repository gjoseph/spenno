import {
  AppBar,
  ButtonGroup,
  IconButton as MuiIconButton,
  Slide,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useScrollTrigger,
} from "@mui/material";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { MouseEventHandler } from "react";

const IconButton: React.FC<{
  icon: React.JSXElementConstructor<any>;
  onClick?: MouseEventHandler | undefined;
}> = (props) => (
  <MuiIconButton
    size="large"
    edge="start"
    color="inherit"
    aria-label="menu"
    sx={{ ml: 0 }}
  >
    <props.icon onClick={props.onClick} />
  </MuiIconButton>
);

type IconAndDialogContent = {
  icon: React.JSXElementConstructor<any>;
  title: React.ReactNode;
  content?: React.ReactNode;
  onClick?: (() => void) | (() => Promise<void>) | undefined;
};

export const TopBar: React.FC<{
  appTitle: React.ReactNode;
  appIcon: React.JSXElementConstructor<any>;
  iconAndDialogs: IconAndDialogContent[];
}> = (props) => {
  const [open, setOpen] = React.useState<number>(-1);
  const handleOpen = (idx: number) => () => setOpen(idx);
  const handleClose = () => setOpen(-1);
  const scrollTrigger = useScrollTrigger({
    // disableHysteresis: true, // i don't really understand what this is
    threshold: 0,
  });

  return (
    <React.Fragment>
      <Slide appear={false} direction="down" in={!scrollTrigger}>
        <AppBar>
          <Toolbar>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              {props.appTitle}
              <props.appIcon
                sx={{ position: "relative", bottom: -10 }}
                fontSize="large"
              />
            </Typography>
            <ButtonGroup color="inherit">
              {props.iconAndDialogs.map((i, idx) => {
                return (
                  <IconButton
                    icon={i.icon}
                    onClick={i.onClick || handleOpen(idx)}
                    key={idx}
                  />
                );
              })}
            </ButtonGroup>

            {/* TODO we could make these draggable and keep open https://mui.com/components/dialogs/#draggable-dialog*/}
            {props.iconAndDialogs.map((i, idx) => (
              <Dialog open={open === idx} onClose={handleClose} key={idx}>
                <DialogTitle>{i.title}</DialogTitle>
                <DialogContent>{i.content}</DialogContent>
              </Dialog>
            ))}
          </Toolbar>

          {props.children}
        </AppBar>
      </Slide>

      <Slide direction="up" in={scrollTrigger}>
        <SpeedDial
          ariaLabel="Quick access menu"
          // positioning is only needed because of the slide
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          icon={<SpeedDialIcon icon={<props.appIcon />} />}
        >
          {props.iconAndDialogs.map((i, idx) => (
            <SpeedDialAction
              key={idx}
              icon={<i.icon />}
              tooltipTitle={i.title}
              onClick={i.onClick || handleOpen(idx)}
            />
          ))}
        </SpeedDial>
      </Slide>
    </React.Fragment>
  );
};
