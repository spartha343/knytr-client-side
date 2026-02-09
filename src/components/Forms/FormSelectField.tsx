"use client";

import { getErrorMessageByPropertyName } from "@/utils/schema-validator";
import { Select } from "antd";
import { useFormContext, Controller } from "react-hook-form";

export type SelectOptions = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  options: SelectOptions[];
  name: string;
  size?: "large" | "small";
  value?: string | string[] | undefined;
  placeholder?: string;
  label?: string;
  defaultValue?: string;
  handleChange?: (el: string) => void;
  required?: boolean;
  mode?: "multiple" | "tags";
};

const FormSelectField = ({
  name,
  size = "large",
  value,
  placeholder = "Select",
  options,
  label,
  defaultValue,
  handleChange,
  required,
  mode,
}: SelectFieldProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const errorMessage = getErrorMessageByPropertyName(errors, name);

  return (
    <>
      {required && <span style={{ color: "red" }}>*</span>}
      {label && <span>{label}</span>}
      <Controller
        control={control}
        name={name}
        render={({ field: { value: fieldValue, onChange } }) => (
          <Select
            mode={mode}
            onChange={handleChange ? handleChange : onChange}
            size={size}
            options={options}
            value={value || fieldValue}
            style={{ width: "100%" }}
            placeholder={placeholder}
            defaultValue={defaultValue}
            allowClear
          />
        )}
      />
      <small style={{ color: "red" }}>{errorMessage}</small>
    </>
  );
};

export default FormSelectField;
