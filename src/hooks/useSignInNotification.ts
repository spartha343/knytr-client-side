"use client";

import { useEffect, useRef } from "react";
import { notification } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setSignInIntent } from "@/redux/features/auth/authSlice";

/**
 * Hook to show success notification and redirect after sign-in.
 *
 * Should be used in sign-in/sign-up pages only.
 * Monitors for successful authentication and shows appropriate feedback.
 *
 * Usage:
 * - Import in SignIn.tsx and SignUp.tsx
 * - Just call the hook: useSignInNotification()
 */
export const useSignInNotification = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dbUser, signInIntent } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Prevent duplicate notifications and redirects
  const processed = useRef(false);

  useEffect(() => {
    // Reset when user logs out
    if (!dbUser) {
      processed.current = false;
      return;
    }

    // Only proceed if:
    // 1. User is fully authenticated (has dbUser)
    // 2. This was an intentional sign-in (signInIntent is true)
    // 3. We haven't already processed this sign-in
    if (!signInIntent || processed.current) {
      return;
    }

    // Mark as processed immediately to prevent duplicate processing
    processed.current = true;

    // Get redirect destination
    const redirect = searchParams.get("redirect");
    const safeRedirect = redirect?.startsWith("/") ? redirect : "/";

    // Show success notification
    notification.success({
      title: "Signed In Successfully!",
      description: "Welcome back! Redirecting you...",
      placement: "topRight",
      duration: 3,
      showProgress: true,
    });

    // Clear the sign-in intent flag
    dispatch(setSignInIntent(false));

    // Redirect with a small delay to ensure everything is ready
    const timeoutId = setTimeout(() => {
      router.replace(safeRedirect);
    }, 300);

    // Cleanup
    return () => clearTimeout(timeoutId);
  }, [dbUser, signInIntent, router, searchParams, dispatch]);
};
