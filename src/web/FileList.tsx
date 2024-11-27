import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { FileDescriptor } from "../domain/file";

export type FileToggleCallback = (filePath: string, checked: boolean) => void;
type CheckboxEventHandler = (
  event: React.SyntheticEvent<Element, Event>,
  checked: boolean,
) => void;

const FileLabel: React.FC<{ file: FileDescriptor }> = ({ file }) => {
  return (
    <React.Fragment>
      {file.label}{" "}
      <Typography variant="caption" display="inline" gutterBottom>
        {/* TODO this isn't really relevant anymore because we don't get the file until it's parsed iirc */}
        ({file.recordCount ? `${file.recordCount} records` : "parsing ..."})
      </Typography>
    </React.Fragment>
  );
};

const FileWithCheckbox: React.FC<{
  file: FileDescriptor;
  handleChange: CheckboxEventHandler;
}> = ({ file, handleChange }) => {
  return (
    <FormControlLabel
      control={<Checkbox />}
      checked={file.enabled}
      name={file.id}
      onChange={handleChange}
      label={<FileLabel file={file} />}
    />
  );
};

export const FileList: React.FC<{
  files: FileDescriptor[];
  toggleFile: FileToggleCallback;
}> = (props) => {
  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    checked: boolean,
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
        <FormGroup>
          {props.files.map((file, idx) => (
            <FileWithCheckbox
              key={idx}
              file={file}
              handleChange={handleChange}
            />
          ))}
        </FormGroup>
        {/* Removed drag'n'drop, see commit ae5beb4 */}
        {/*<FormHelperText>*/}
        {/*  Drop {props.files.length > 0 ? "more" : ""} files here*/}
        {/*</FormHelperText>*/}
      </FormControl>
    </Box>
  );
};
