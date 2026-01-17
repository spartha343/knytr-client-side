import * as yup from "yup";
export const signInSchema = yup.object().shape({
  email: yup
    .string()
    .email("Must be a valid email !")
    .required("Email is required !"),
  password: yup.string().min(6).max(20).required(),
});
