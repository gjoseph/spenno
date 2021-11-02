import type {
  AutocompleteRenderGetTagProps,
  AutocompleteRenderInputParams,
  AutocompleteRenderOptionState,
} from "@mui/material/Autocomplete/Autocomplete";
import Chip from "@mui/material/Chip";
import * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { Category } from "../../domain/category";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

// Based on https://mui.com/components/autocomplete/#checkboxes
// We should also look at https://mui.com/components/autocomplete/#custom-filter
// and https://mui.com/components/autocomplete/#virtualization

const renderInput = (params: AutocompleteRenderInputParams) => {
  return <TextField {...params} label="Categories" />;
};

const getOptionLabel = (category: Category) => category;
const renderOption = (
  props: React.HTMLAttributes<HTMLLIElement>,
  category: Category,
  { selected }: AutocompleteRenderOptionState
) => (
  <li {...props}>
    <Checkbox
      icon={icon}
      checkedIcon={checkedIcon}
      style={{ marginRight: 8 }}
      checked={selected}
    />
    {category}
  </li>
);

// This is the default, but at least we have it at the ready
const renderTags = (
  categories: Category[],
  getTagProps: AutocompleteRenderGetTagProps
) => {
  return categories.map((c, index) => (
    <Chip
      label={getOptionLabel(c)}
      // size={}
      {...getTagProps({ index })}
    />
  ));
};

export const CategorySelect: React.FC<{ allCategories: Category[] }> = (
  props
) => {
  return (
    <Autocomplete
      multiple
      options={props.allCategories}
      // disableCloseOnSelect
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      renderInput={renderInput}
      renderTags={renderTags}
    />
  );
};
