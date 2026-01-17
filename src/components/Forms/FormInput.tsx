"use client";
import { Input } from "antd";
import { Controller, useFormContext } from "react-hook-form";

interface IInput {
  name: string;
  type?: string;
  size?: "large" | "small";
  value?: string | string[];
  id?: string;
  placeholder?: string;
  validation?: object;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

const FormInput = ({
  name,
  //   id,
  label,
  placeholder,
  required,
  size = "large",
  type,
  disabled,
}: //   validation,
// value,
IInput) => {
  const { control } = useFormContext();
  return (
    <>
      {required && <span style={{ color: "red" }}>*</span>}
      {label ? label : null}
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) =>
          type === "password" ? (
            <>
              <Input.Password
                {...field}
                type={type}
                size={size}
                disabled={disabled}
                placeholder={placeholder}
              />
              {fieldState.error?.message && (
                <div style={{ color: "red" }}>{fieldState.error.message}</div>
              )}
            </>
          ) : (
            <>
              <Input
                {...field}
                type={type}
                size={size}
                disabled={disabled}
                placeholder={placeholder}
              />
              {fieldState.error?.message && (
                <div style={{ color: "red" }}>{fieldState.error.message}</div>
              )}
            </>
          )
        }
      />
    </>
  );
};

export default FormInput;
