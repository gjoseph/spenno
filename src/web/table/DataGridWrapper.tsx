import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import * as React from "react";
import { v4 as uuidv4 } from "uuid";

// All this code was sorta meaningful with our custom quicksearch.
// TODO assess if default quicksearch does this like we want -- not sure i remember wtf this was about
// const escapeRegExp = (value: string): string => {
//   return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
// };
//
// const genericRowFilter = (searchValue: string) => (row: any) => {
//   const searchRegex = new RegExp(escapeRegExp(searchValue), "i");
//   return Object.keys(row).some((field: any) => {
//     return searchRegex.test(row[field]?.toString());
//   });
// };

const rowsWithIdField = <T,>(rows: T[], addIdField: boolean = false) =>
  addIdField ? rows.map((e, idx) => ({ ...e, id: uuidv4() })) : rows;

type DataGridWrapperProps<T> = {
  columns: GridColDef[];
  rows: T[];
  rowFilter?: (row: T) => boolean;
  addIdField?: boolean;
};

export const DataGridWrapper = <T,>(props: DataGridWrapperProps<T>) => {
  const [rows, setRows] = React.useState<T[]>(() => {
    // TODO: not sure initialState is needed, since we have a useEffect below that also sets it
    return rowsWithIdField(props.rows, props.addIdField);
  });

  // All this code was sorta meaningful with our custom quicksearch.
  // TODO assess if default quicksearch does this like we want -- not sure i remember wtf this was about
  // const [searchText, setSearchText] = React.useState("");
  // const requestSearch = (searchValue: string) => {
  //   setSearchText(searchValue);
  //   const rowFilter = props.rowFilter || genericRowFilter(searchValue);
  //   const filteredRows = props.rows.filter(rowFilter);
  //   setRows(rowsWithIdField(filteredRows, props.addIdField));
  // };

  React.useEffect(() => {
    setRows(rowsWithIdField(props.rows, props.addIdField));
  }, [props.rows, props.addIdField]);

  return (
    <React.Fragment>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ flexGrow: 1 }}>
          <DataGrid
            columns={props.columns}
            rows={rows}
            getRowId={(row) => row.id} // Just for clarity, since this is the default behaviour if getRowId is not specified
            paginationModel={{ page: 0, pageSize: 100 }}
            pageSizeOptions={[100]}
            autoHeight
            density="compact"
            disableRowSelectionOnClick
            disableColumnMenu // we always want all our columns
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
            // TODO https://mui.com/components/data-grid/components/#cell has an example that allows a popover to show the full value
            // value of a cell (e.g for filePath)
          />
        </div>
      </div>
    </React.Fragment>
  );
};
