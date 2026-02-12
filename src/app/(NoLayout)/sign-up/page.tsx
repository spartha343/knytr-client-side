import SignUp from "@/components/SignUp/SignUp";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up || Knytr",
};

const SignUpPage = () => {
  return (
    <div>
      <SignUp />
    </div>
  );
};

export default SignUpPage;
