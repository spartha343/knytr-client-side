"use client";

import { getErrorMessageByPropertyName } from "@/utils/schema-validator";
import { DatePicker, DatePickerProps } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useFormContext, Controller } from "react-hook-form";

type KDatePickerProps = {
  onChange?: (valOne: Dayjs | null, valTwo: string) => void;
  name: string;
  label?: string;
  value?: Dayjs;
  size?: "large" | "small";
  required?: boolean;
};

const FormDatePicker = ({
  name,
  label,
  onChange,
  size = "large",
  required,
}: KDatePickerProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const errorMessage = getErrorMessageByPropertyName(errors, name);

  const handleOnChange: DatePickerProps["onChange"] = (date, dateString) => {
    // Fixed: Proper handling of the callback
    if (onChange && date && !Array.isArray(date)) {
      onChange(date, dateString as string);
    }
  };

  return (
    <>
      {required && <span style={{ color: "red" }}>*</span>}
      {label && <span>{label}</span>}
      <br />
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <DatePicker
            value={field.value ? dayjs(field.value) : null}
            size={size}
            onChange={(date, dateString) => {
              field.onChange(date);
              handleOnChange(date, dateString);
            }}
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
          />
        )}
      />
      <small style={{ color: "red" }}>{errorMessage}</small>
    </>
  );
};

export default FormDatePicker;
