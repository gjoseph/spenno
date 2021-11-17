import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import { GridToolbarFilterButton } from "@mui/x-data-grid";
import * as React from "react";

interface QuickSearchToolbarProps {
  clearSearch: () => void;
  onChange: () => void;
  value: string;
}

// Copied from https://mui.com/components/data-grid/filtering/#quick-filter
// Somewhat simplified, and I adapted the style examples as much as I could using sx, not convinced it's all very necessary

export const QuickSearchToolbar: React.FC<QuickSearchToolbarProps> = (
  props
) => {
  return (
    <Box
      sx={{
        p: 0,
        pt: 0.5,
        pr: 0.5,
        justifyContent: "space-between",
        display: "flex",
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      <GridToolbarFilterButton sx={{ my: 1, mr: 0.5, ml: 1.5 }} />
      <TextField
        variant="standard"
        size="small" // this doesn't make a whole lot of difference...
        value={props.value}
        onChange={props.onChange}
        placeholder="Search…"
        sx={{
          // less than sm should have width 100%
          width: { xs: "100%", sm: "auto" },
          // use all space left in flex row
          flexGrow: 1,
          my: 1,
          mr: 0.5,
          ml: 1.5,
          // '& .MuiSvgIcon-root': { marginRight: theme.spacing(0.5), },
          // '& .MuiInput-underline:before': { borderBottom: `1px solid ${theme.palette.divider}`, },
        }}
        InputProps={{
          startAdornment: <SearchIcon fontSize="small" />,
          endAdornment: (
            <IconButton
              title="Clear"
              aria-label="Clear"
              size="small"
              style={{ visibility: props.value ? "visible" : "hidden" }}
              onClick={props.clearSearch}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          ),
        }}
      />
    </Box>
  );
};
