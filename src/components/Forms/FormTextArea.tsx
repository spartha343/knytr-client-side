"use client";

import { getErrorMessageByPropertyName } from "@/utils/schema-validator";
import { Input } from "antd";
import { useFormContext, Controller } from "react-hook-form";

interface IInput {
  name: string;
  value?: string | string[] | undefined;
  placeholder?: string;
  label?: string;
  rows?: number;
  required?: boolean;
}

const FormTextArea = ({
  name,
  value,
  placeholder,
  label,
  rows = 4,
  required,
}: IInput) => {
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
        render={({ field }) => (
          <Input.TextArea
            rows={rows}
            placeholder={placeholder}
            {...field}
            value={value || field.value}
          />
        )}
      />
      <small style={{ color: "red" }}>{errorMessage}</small>
    </>
  );
};

export default FormTextArea;
