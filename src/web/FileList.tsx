import Typography from "@mui/material/Typography";
import * as React from "react";
import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Checkbox from "@mui/material/Checkbox";
import { TransactionsFile } from "../domain/file";

// TODO perhaps these props could be file "descriptor" ie without the records, if that makes a diff
export type FileToggleCallback = (filePath: string, checked: boolean) => void;

const FileLabel: React.FC<{ file: TransactionsFile }> = ({ file }) => {
  return (
    <React.Fragment>
      {file.filePath}{" "}
      <Typography variant="caption" display="inline" gutterBottom>
        (
        {file.rawRecords
          ? `${file.rawRecords.length} records`
          : "not parsed yet!?"}
        )
      </Typography>
    </React.Fragment>
  );
};

export const FileList: React.FC<{
  files: TransactionsFile[];
  toggleFile: FileToggleCallback;
}> = (props) => {
  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    checked: boolean
  ) => {
    const target: any = event.target; // TODO YIKES TYPES
    // The element's name property is set to fileId
    props.toggleFile(target.name, checked);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <FormControl
        required
        error={false}
        component="fieldset"
        variant="standard"
      >
        <FormLabel component="legend">Files</FormLabel>
        <FormGroup>
          {props.files.map((file: TransactionsFile, idx: number) => (
            <FormControlLabel
              key={idx}
              control={<Checkbox />}
              checked={file.enabled}
              name={file.id}
              onChange={handleChange}
              label={<FileLabel file={file} />}
            />
          ))}
        </FormGroup>
        <FormHelperText>Drop more files here</FormHelperText>
      </FormControl>
    </Box>
  );
};
