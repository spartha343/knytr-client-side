"use client";
import { Button, Col, Divider, notification, Row } from "antd";
import signInImg from "../../assets/sign-in-img.svg";
import Image from "next/image";
import Form from "../Forms/Form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signInSchema } from "@/schemas/signIn";
import FormInput from "../Forms/FormInput";
import { SubmitHandler } from "react-hook-form";
import Link from "next/link";
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

const SignIn = () => {
  const { user } = useAuthSignIn();
  const shownError = useRef(false);
  const { markIntent } = useAuthIntent();

  const [signInWithEmailAndPassword, , loading, error] =
    useSignInWithEmailAndPassword(auth);

  const onSubmit: SubmitHandler<FormValues> = async (data: FormValues) => {
    markIntent();
    shownError.current = false;
    const { email, password } = data;
    await signInWithEmailAndPassword(email, password);
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
    <Row
      justify={"center"}
      align={"middle"}
      style={{
        minHeight: "100vh",
      }}
    >
      <Col xs={{ order: 2 }} md={{ order: 1, span: 12 }} lg={11}>
        <Image
          src={signInImg}
          alt="Sign in image"
          style={{ width: "100%", height: "auto" }}
          loading="eager"
        />
      </Col>
      <Col
        xs={{ order: 1 }}
        md={{ order: 2, span: 12 }}
        lg={13}
        style={{ margin: "30px 0" }}
      >
        <h1 style={{ margin: "15px 0" }}>Please Sign In !</h1>
        <Form submitHandler={onSubmit} resolver={yupResolver(signInSchema)}>
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
          >
            Sign In
          </Button>
          <p style={{ margin: "20px 0", fontSize: "1.1rem" }}>
            Don&apos;t have an account ? Please{" "}
            <Link href="/sign-up">Sign Up</Link>{" "}
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

export default SignIn;
