import Container from "@/components/shared/Container";
import SignUp from "@/components/SignUp/SignUp";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up || Knytr",
};

const SignUpPage = () => {
  return (
    <Container>
      <SignUp />
    </Container>
  );
};

export default SignUpPage;
