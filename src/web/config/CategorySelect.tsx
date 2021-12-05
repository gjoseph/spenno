import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import Autocomplete from "@mui/material/Autocomplete";
import type {
  AutocompleteRenderGetTagProps,
  AutocompleteRenderInputParams,
  AutocompleteRenderOptionState,
} from "@mui/material/Autocomplete/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import * as React from "react";
import { Category } from "../../domain/category";
import { SetFilterConfig } from "../App";

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

// Don't render anything in the field, we just use it as a search input
const renderTags = (
  categories: Category[],
  getTagProps: AutocompleteRenderGetTagProps
) => {
  return null;
};

const getLimitTagsText = (count: number) =>
  `${count} categor${count === 1 ? "y" : "ies"} selected`;

export interface CategorySelectProps {
  allCategories: Category[];
  selectedCategories: Category[];
  setFilterConfig: SetFilterConfig;
}

export const CategorySelect: React.FC<CategorySelectProps> = (props) => {
  const [value, setValue] = React.useState(props.selectedCategories);
  const onChange = (_: React.SyntheticEvent, newValue: Category[]) => {
    props.setFilterConfig((prev) => ({ ...prev, categories: newValue }));
    setValue(newValue);
  };
  // TODO need a button to select all
  return (
    <Autocomplete
      multiple
      value={value}
      options={props.allCategories}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      renderInput={renderInput}
      renderTags={renderTags}
      onChange={onChange}
      limitTags={0}
      getLimitTagsText={getLimitTagsText}
      disableCloseOnSelect
      openOnFocus
      handleHomeEndKeys
      // Not sure I understand these 2 either, but recommended by https://mui.com/components/autocomplete/#creatable
      selectOnFocus
      clearOnBlur
      // Not sure I understand the interaction between these 3 exactly, but it renders the focused option in search box while allowing to continue typing
      freeSolo
      autoComplete
      autoSelect
    />
  );
};
