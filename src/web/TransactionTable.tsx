import { v4 as uuidv4 } from "uuid";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import * as React from "react";
import { Bank } from "../domain/accounts";
import { Transaction } from "../domain/transaction";

import { TRANSACTIONS_GRID_COLUMNS } from "./table/TransactionsGridColumns";

//
// const CategoryView: React.FC<{ category: Category }> = ({ category }) => {
//   const className =
//     category === UNCATEGORISED ? "category-uncategorised" : "category";
//   return <span {...{ className }}>{category}</span>;
// };

// const AmountView: React.FC<{ amount: Big }> = ({ amount }) => {
//   // negative for a debit, positive for a credit
//   return (
//     <span className={amount.lt(0) ? "amount-debit" : "amount-credit"}>
//       ${amount.toString()}
//     </span>
//   );
// };

// TODO this is not the right place to do this, a stable ID should be gen'd somewhere else?
const transactionsWithId = (transactions: Transaction[]) => {
  // TODO this is not the right place to do this, a stable ID should be gen'd somewhere else?
  return transactions.map((t) => ({
    id: uuidv4(),
    ...t,
  }));
};

type TransactionRow = { id: string } & Transaction;
export const TransactionTable: React.FC<{
  accounts: Bank.Accounts;
  transactions: Transaction[];
}> = ({ accounts, transactions }) => {
  const [rows, setRows] = React.useState<TransactionRow[]>(() => {
    return transactionsWithId(transactions);
  });

  React.useEffect(() => {
    setRows(transactionsWithId(transactions));
  }, [transactions]);

  return (
    <React.Fragment>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ flexGrow: 1 }}>
          <DataGrid
            rows={rows}
            columns={TRANSACTIONS_GRID_COLUMNS}
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
// these examples were presumably written for v4, so see https://mui.com/guides/migration-v4/#styles

import { createStyles, makeStyles, Theme } from "@mui/material/styles";
import {
  createTheme,
  ThemeProvider,
  StyledEngineProvider,
} from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import { GridToolbarDensitySelector } from "@mui/x-data-grid";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";

function escapeRegExp(value: string): string {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

const defaultTheme: Theme = createTheme();
const useStyles = makeStyles(
  (theme: Theme) =>
    createStyles({
      root: {
        padding: theme.spacing(0.5, 0.5, 0),
        justifyContent: 'space-between',
        display: 'flex',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
      },
      textField: {
        [theme.breakpoints.down('sm')]: {
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
