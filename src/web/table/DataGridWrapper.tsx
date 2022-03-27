import { DataGrid, GridColDef } from "@mui/x-data-grid";
import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import { QuickSearchToolbar } from "./QuickSearchToolbar";

const escapeRegExp = (value: string): string => {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

const genericRowFilter = (searchValue: string) => (row: any) => {
  const searchRegex = new RegExp(escapeRegExp(searchValue), "i");
  return Object.keys(row).some((field: any) => {
    return searchRegex.test(row[field]?.toString());
  });
};

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

  const [searchText, setSearchText] = React.useState("");
  const requestSearch = (searchValue: string) => {
    setSearchText(searchValue);
    const rowFilter = props.rowFilter || genericRowFilter(searchValue);
    const filteredRows = props.rows.filter(rowFilter);
    setRows(rowsWithIdField(filteredRows, props.addIdField));
  };

  React.useEffect(() => {
    setRows(rowsWithIdField(props.rows, props.addIdField));
  }, [props.rows, props.addIdField]);

  return (
    <React.Fragment>
      {/*
      this keeps the whole table and tabs at the top of page, headers remain visible and content of table scroll
      but i'd like to scroll past tabs as well, so that the headers are stuck to the top of the window (or float?)
      */}
      <div style={{ height: "100vh", width: "100%" }}>
        <div style={{ display: "flex", height: "100%" }}>
          <div style={{ flexGrow: 1 }}>
            <DataGrid
              columns={props.columns}
              rows={rows}
              getRowId={(row) => row.id} // Just for clarity, since this is the default behaviour if getRowId is not specified
              pageSize={100}
              rowsPerPageOptions={[100]} // single value disables rowsPerPage selector
              // autoHeight
              // autoPageSize
              density="compact"
              disableSelectionOnClick
              disableColumnMenu // we always want all our columns
              components={{ Toolbar: QuickSearchToolbar }}
              componentsProps={{
                toolbar: {
                  value: searchText,
                  onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                    requestSearch(event.target.value),
                  clearSearch: () => requestSearch(""),
                },
              }}
              // TODO https://mui.com/components/data-grid/components/#cell has an example that allows a popover to show the full value
              // value of a cell (e.g for filePath)
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
