import { v4 as uuidv4 } from "uuid";
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridRenderCellParams,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import Big from "big.js";
import { Moment } from "moment";
import "moment/locale/en-au";
import * as React from "react";
import { Bank } from "../domain/accounts";
import { Category, UNCATEGORISED } from "../domain/category";
import { Transaction } from "../domain/transaction";

//
// const CategoryView: React.FC<{ category: Category }> = ({ category }) => {
//   const className =
//     category === UNCATEGORISED ? "category-uncategorised" : "category";
//   return <span {...{ className }}>{category}</span>;
// };

const AmountView: React.FC<{ amount: Big }> = ({ amount }) => {
  // negative for a debit, positive for a credit
  return (
    <span className={amount.lt(0) ? "amount-debit" : "amount-credit"}>
      ${amount.toString()}
    </span>
  );
};

// TODO this is not the right place to do this, a stable ID should be gen'd somewhere else?
type TransactionRow = { id: string } & Transaction;
export const TransactionTable: React.FC<{
  accounts: Bank.Accounts;
  transactions: Transaction[];
}> = ({ accounts, transactions }) => {
  // TODO this is not the right place to do this, a stable ID should be gen'd somewhere else?
  const rows = transactions.map((t) => ({
    id: uuidv4(),
    ...t,
  }));
  const columns: GridColDef[] = [
    {
      field: "account",
      headerName: "Account",
      flex: 1,
      valueGetter: (p) => p.value.name,
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      // It seems sorting just works -- either data grid knows about moment, or moment instances are Comparable
      valueFormatter: (p) => {
        // assuming p.value is a Moment
        const value = p.value as Moment | undefined;
        // obviously not the right place to change locale, but fuck those default us date formats
        return value?.format("L");
        // It seems like importing the locale was enough (it's possibly picked up by browser)
        // return value?.locale("en-AU").format("L");
      },
    },
    {
      field: "desc",
      headerName: "Description",
      flex: 3,
      sortable: false,
    },
    {
      field: "merchant",
      headerName: "Merchant",
      type: "number",
      flex: 2,
    },
    {
      field: "amount",
      headerName: "Amount",
      type: "number",
      flex: 1.5,
      // Alternatively we could use a cellClassName instead of renderCell, see e.g category
      renderCell: (p: GridRenderCellParams<Big>) => (
        <AmountView amount={p.value} />
      ),
    },
    {
      field: "category",
      headerName: "Category",
      flex: 2,
      // renderCell: (p: GridRenderCellParams<Category>) => (
      //   <CategoryView category={p.value} />
      // ),
      cellClassName: (p: GridCellParams<Category>) =>
        p.value === UNCATEGORISED ? "category-uncategorised" : "category",
    },
  ];
  return (
    <React.Fragment>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ flexGrow: 1 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={100}
            rowsPerPageOptions={[5]}
            autoHeight
            density="compact"
            disableColumnMenu // we always want all our columns, and we enable filtering like so:
            components={{
              Toolbar: SimpleToolbar,
            }}
            // see below for "quick search"
            // components={{ Toolbar: QuickSearchToolbar }}
            // componentsProps={{
            //   toolbar: {
            //     value: searchText,
            //     onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
            //       requestSearch(event.target.value),
            //     clearSearch: () => requestSearch(''),
            //  },
            //}}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

const SimpleToolbar = () => (
  <GridToolbarContainer>
    {/*<GridToolbarColumnsButton />*/}
    <GridToolbarFilterButton />
    {/*<GridToolbarDensitySelector />*/}
    {/*<GridToolbarExport />*/}
  </GridToolbarContainer>
);

/*
// Copied from https://mui.com/components/data-grid/filtering/#quick-filter (Jesus...)

import { createStyles, makeStyles } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import {
  GridToolbarDensitySelector,
} from '@mui/x-data-grid';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { createTheme } from '@mui/material/styles';
// import { createStyles, makeStyles } from '@mui/styles';

function escapeRegExp(value: string): string {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

const defaultTheme = createTheme();
const useStyles = makeStyles(
  (theme: any) =>
    createStyles({
      root: {
        padding: theme.spacing(0.5, 0.5, 0),
        justifyContent: 'space-between',
        display: 'flex',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
      },
      textField: {
        [theme.breakpoints.down('xs')]: {
          width: '100%',
        },
        margin: theme.spacing(1, 0.5, 1.5),
        '& .MuiSvgIcon-root': {
          marginRight: theme.spacing(0.5),
        },
        '& .MuiInput-underline:before': {
          borderBottom: `1px solid ${theme.palette.divider}`,
        },
      },
    }),
  { defaultTheme },
);

interface QuickSearchToolbarProps {
  clearSearch: () => void;
  onChange: () => void;
  value: string;
}

function QuickSearchToolbar(props: QuickSearchToolbarProps) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div>
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
      </div>
      <TextField
        variant="standard"
        value={props.value}
        onChange={props.onChange}
        placeholder="Search…"
        className={classes.textField}
        InputProps={{
          startAdornment: <SearchIcon fontSize="small" />,
          endAdornment: (
            <IconButton
              title="Clear"
              aria-label="Clear"
              size="small"
              style={{ visibility: props.value ? 'visible' : 'hidden' }}
              onClick={props.clearSearch}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          ),
        }}
      />
    </div>
  );
}

  const [searchText, setSearchText] = React.useState('');

  const requestSearch = (searchValue: string) => {
    setSearchText(searchValue);
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');
    const filteredRows = data.rows.filter((row: any) => {
      return Object.keys(row).some((field: any) => {
        return searchRegex.test(row[field].toString());
      });
    });
    setRows(filteredRows);
  };

  React.useEffect(() => {
    setRows(data.rows);
  }, [data.rows]);

}
*/
