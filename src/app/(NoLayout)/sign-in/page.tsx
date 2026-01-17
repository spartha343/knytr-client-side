import Container from "@/components/shared/Container";
import SignIn from "@/components/SignIn/SignIn";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in || Knytr",
};

const SignInPage = () => {
  return (
    <Container>
      <SignIn />
    </Container>
  );
};

export default SignInPage;
