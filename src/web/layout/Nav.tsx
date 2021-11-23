import {
  AppBar,
  ButtonGroup,
  IconButton as MuiIconButton,
} from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { MouseEventHandler } from "react";
import * as React from "react";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { AddFile, withDropZone } from "../filedrop/FileDrop";

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
const FileDropIcon = withDropZone(IconButton);

type IconAndDialogContent = {
  icon: React.JSXElementConstructor<any>;
  title: React.ReactNode;
  content: React.ReactNode;
  onDrop?: AddFile;
};

export const TopBar: React.FC<{
  iconAndDialogs: IconAndDialogContent[];
}> = (props) => {
  const [open, setOpen] = React.useState<number>(-1);
  const handleOpen = (idx: number) => () => setOpen(idx);
  const handleClose = () => setOpen(-1);

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
          {props.iconAndDialogs.map((i, idx) => {
            // Surely, there is a more React-like way of using an HoC like FileDropIcon without this if statement
            if (i.onDrop) {
              return (
                <FileDropIcon
                  minimal
                  icon={i.icon}
                  onClick={handleOpen(idx)}
                  addFile={i.onDrop}
                  key={idx}
                />
              );
            } else {
              return (
                <IconButton icon={i.icon} onClick={handleOpen(idx)} key={idx} />
              );
            }
          })}
        </ButtonGroup>

        {/* TODO we could make these draggable and keep open https://mui.com/components/dialogs/#draggable-dialog*/}
        {props.iconAndDialogs.map((i, idx) => (
          <Dialog open={open === idx} onClose={handleClose}>
            <DialogTitle>{i.title}</DialogTitle>
            <DialogContent>{i.content}</DialogContent>
          </Dialog>
        ))}
      </Toolbar>

      {props.children}
    </AppBar>
  );
};
