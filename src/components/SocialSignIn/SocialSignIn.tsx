/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button, notification, Space } from "antd";
import { auth } from "@/firebase/firebase.config";
import {
  useSignInWithGoogle,
  useSignInWithFacebook,
  useSignInWithMicrosoft,
} from "react-firebase-hooks/auth";
import { useEffect, useRef } from "react";
import { useAuthIntent } from "@/hooks/useAuthIntent";

const SocialSignIn = () => {
  // Hooks per provider
  const [signInWithGoogle, userGoogle, loadingGoogle, errorGoogle] =
    useSignInWithGoogle(auth);
  const [signInWithFacebook, userFacebook, loadingFacebook, errorFacebook] =
    useSignInWithFacebook(auth);
  const [signInWithMicrosoft, userMicrosoft, loadingMicrosoft, errorMicrosoft] =
    useSignInWithMicrosoft(auth);
  const { markIntent } = useAuthIntent();

  const shownError = useRef(false);
  // Check if any user is logged in
  const user = userGoogle || userFacebook || userMicrosoft;
  // Check if any error occurred
  const error = errorGoogle || errorFacebook || errorMicrosoft;

  const isLoading = loadingGoogle || loadingFacebook || loadingMicrosoft;

  useEffect(() => {
    if (isLoading) {
      shownError.current = false;
    }
  }, [isLoading]);

  useEffect(() => {
    if (!error || shownError.current) return;
    shownError.current = true;
    if (error) {
      notification.error({
        title: "Login Failed",
        description: error.message,
        placement: "topRight",
        showProgress: true,
        duration: 5,
      });
    }
  }, [error]);

  return (
    <Space style={{ marginTop: 15 }} wrap>
      <Button
        type="default"
        onClick={async () => {
          markIntent();
          await signInWithGoogle();
        }}
        loading={loadingGoogle}
        disabled={!!user || isLoading}
      >
        Sign in with Google
      </Button>
      {/* <Button
        type="default"
        onClick={() => signInWithFacebook()}
        loading={loadingFacebook}
        disabled={!!user || isLoading}
      >
        Sign in with Facebook
      </Button>
      <Button
        type="default"
        onClick={() => signInWithMicrosoft()}
        loading={loadingMicrosoft}
        disabled={!!user || isLoading}
      >
        Sign in with GitHub
      </Button> */}
    </Space>
  );
};

export default SocialSignIn;
