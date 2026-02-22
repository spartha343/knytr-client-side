"use client";
import { Button, Divider, notification } from "antd";
import Form from "../Forms/Form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signInSchema } from "@/schemas/signIn";
import FormInput from "../Forms/FormInput";
import { SubmitHandler } from "react-hook-form";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase.config";
import { useEffect, useRef } from "react";
import SocialSignIn from "../SocialSignIn/SocialSignIn";
import { useAuthSignIn } from "@/hooks/useAuthSignIn";
import { useAuthIntent } from "@/hooks/useAuthIntent";

type FormValues = {
  email: string;
  password: string;
};

interface SignInProps {
  onSuccess?: () => void;
}

const SignIn = ({ onSuccess }: SignInProps = {}) => {
  const { user } = useAuthSignIn();
  const shownError = useRef(false);
  const { markIntent } = useAuthIntent();

  const [signInWithEmailAndPassword, , loading, error] =
    useSignInWithEmailAndPassword(auth);

  const onSubmit: SubmitHandler<FormValues> = async (data: FormValues) => {
    markIntent();
    shownError.current = false;
    const { email, password } = data;
    const result = await signInWithEmailAndPassword(email, password);

    // Call onSuccess callback if provided (for drawer mode)
    if (result?.user && onSuccess) {
      setTimeout(() => onSuccess(), 500); // Small delay to ensure auth completes
    }
    // Otherwise, useAuthSignIn will handle redirect automatically
  };

  useEffect(() => {
    if (!error || shownError.current) return;
    shownError.current = true;
    notification.error({
      title: "Sign In Failed",
      description: error.message,
      placement: "topRight",
      duration: 5,
      showProgress: true,
    });
  }, [error]);

  return (
    <div>
      <h2 style={{ margin: "0 0 24px 0" }}>Welcome Back!</h2>
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
            placeholder="Please enter your email"
            disabled={loading}
            required
          />
        </div>

        <div style={{ margin: "15px 0" }}>
          <FormInput
            name="password"
            type="password"
            size="large"
            label="User Password"
            placeholder="Please enter your password"
            required
            disabled={loading}
          />
        </div>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          disabled={!!user?.uid}
          block
          size="large"
        >
          Sign In
        </Button>
      </Form>

      <Divider style={{ marginTop: "32px" }}>Social Sign In Options</Divider>
      <SocialSignIn />
    </div>
  );
};

export default SignIn;
