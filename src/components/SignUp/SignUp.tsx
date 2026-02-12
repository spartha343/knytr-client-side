"use client";
import { Button, Col, Divider, notification, Row } from "antd";
import Form from "../Forms/Form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signInSchema } from "@/schemas/signIn";
import FormInput from "../Forms/FormInput";
import { SubmitHandler } from "react-hook-form";
import Link from "next/link";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase.config";
import { useEffect, useRef } from "react";
import SocialSignIn from "../SocialSignIn/SocialSignIn";
import { useAuthIntent } from "@/hooks/useAuthIntent";

type FormValues = {
  email: string;
  password: string;
};

interface SignUpProps {
  onSuccess?: () => void;
}

const SignUp = ({ onSuccess }: SignUpProps = {}) => {
  const { markIntent } = useAuthIntent();
  const shownError = useRef(false);

  const [createUserWithEmailAndPassword, , loading, error] =
    useCreateUserWithEmailAndPassword(auth);

  const onSubmit: SubmitHandler<FormValues> = async (data: FormValues) => {
    markIntent();
    shownError.current = false;
    const { email, password } = data;
    const result = await createUserWithEmailAndPassword(email, password);
    // Call onSuccess callback if provided (for drawer mode)
    if (result?.user && onSuccess) {
      setTimeout(() => onSuccess(), 500); // Small delay to ensure auth completes
    }
    // Otherwise, useAuthSignIn will handle redirect automatically
  };

  useEffect(() => {
    if (!error || shownError.current) return;
    shownError.current = true;
    if (error) {
      notification.error({
        title: "Signup Failed",
        description: error.message,
        placement: "topRight",
        duration: 5,
        showProgress: true,
      });
    }
  }, [error]);

  return (
    <Row
      justify={"center"}
      align={"middle"}
      style={{
        minHeight: "100vh",
      }}
    >
      <Col style={{ margin: "10px 0" }}>
        <h1 style={{ margin: "15px 0" }}>Please Sign up !</h1>
        <Form
          submitHandler={onSubmit}
          resolver={yupResolver(signInSchema)}
          resetAfterSubmit={false}
        >
          <div>
            <FormInput
              name="email"
              type="email"
              size="large"
              label="User Email"
              placeholder="Please, enter a valid email address"
              required
              disabled={loading}
            />
          </div>

          <div style={{ margin: "15px 0" }}>
            <FormInput
              name="password"
              type="password"
              size="large"
              label="User Password"
              placeholder="Please enter a strong password..."
              required
              disabled={loading}
            />
          </div>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={loading}
            block
          >
            Sign Up
          </Button>
          <p style={{ margin: "20px 0", fontSize: "1.1rem" }}>
            Already have an account ? Please{" "}
            <Link href="/sign-in">Sign In</Link>{" "}
          </p>
        </Form>

        <Divider titlePlacement="start" style={{ marginTop: "50px" }}>
          Social Sign In Options
        </Divider>
        <SocialSignIn />
      </Col>
    </Row>
  );
};

export default SignUp;
