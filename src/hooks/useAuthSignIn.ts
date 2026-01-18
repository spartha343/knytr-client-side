"use client";

import { useEffect, useRef } from "react";
import { notification } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase.config";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  clearDbUser,
  setDbUser,
  setSignInIntent,
  startSync,
} from "@/redux/features/auth/authSlice";
import { ensureDbUserExistsAndReturnProfile } from "@/services/auth.service";

export const useAuthSignIn = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const synced = useRef(false);
  const signInNotified = useRef(false);
  const { signInIntent } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!user?.uid || synced.current) return;
    synced.current = true;

    const redirect = searchParams.get("redirect");
    const safeRedirect = redirect && redirect.startsWith("/") ? redirect : "/";

    dispatch(startSync());

    const handleSyncUserWithBackend = async () => {
      try {
        const result = await ensureDbUserExistsAndReturnProfile();
        dispatch(setDbUser(result.data));

        if (signInIntent && !signInNotified.current) {
          signInNotified.current = true; // prevent duplicates
          notification.success({
            title: "Signed In Successfully !",
            description: "Welcome! Redirecting you...",
            placement: "topRight",
            duration: 5,
            showProgress: true,
          });

          dispatch(setSignInIntent(false));
        }

        router.replace(safeRedirect);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        synced.current = false;
        dispatch(clearDbUser());
        notification.error({
          title: "Sync Error",
          description: "Failed to sync user with backend",
          placement: "topRight",
          duration: 5,
          showProgress: true,
        });
      }
    };

    handleSyncUserWithBackend();
  }, [user?.uid, dispatch, router, searchParams, signInIntent]);

  return {
    user,
  };
};
