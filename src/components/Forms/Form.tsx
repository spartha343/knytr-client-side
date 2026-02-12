/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode, useEffect } from "react";
import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  useForm,
  UseFormSetError,
} from "react-hook-form";

type FormConfig = {
  defaultValues?: Record<string, any>;
  resolver?: any;
};

type FormProps = {
  children: ReactNode;
  submitHandler: SubmitHandler<any>;
  resetAfterSubmit?: boolean;
  onError?: (setError: UseFormSetError<FieldValues>) => void;
} & FormConfig;

/**
 * Reusable Form wrapper using React Hook Form
 *
 * @param submitHandler - Function to call with form data on submit
 * @param defaultValues - Initial form values
 * @param resolver - Validation schema (e.g., yupResolver)
 * @param resetAfterSubmit - Whether to reset form after submission (default: false)
 * @param children - Form fields and buttons
 */
const Form = ({
  children,
  submitHandler,
  defaultValues,
  onError,
  resolver,
  resetAfterSubmit = false, // ✅ Default to NOT resetting
}: FormProps) => {
  const formConfig: FormConfig = {};

  if (!!defaultValues) {
    formConfig["defaultValues"] = defaultValues;
  }
  if (!!resolver) {
    formConfig["resolver"] = resolver;
  }

  const methods = useForm<FieldValues>(formConfig);

  const { handleSubmit, reset } = methods;

  const onSubmit = (data: any) => {
    submitHandler(data);

    // ✅ Only reset if explicitly requested
    if (resetAfterSubmit) {
      reset();
    }
  };

  useEffect(() => {
    if (onError) {
      onError(methods.setError);
    }
  }, [onError, methods.setError]);

  // Update form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>{children}</form>
    </FormProvider>
  );
};

export default Form;
