"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setSignInIntent } from "@/redux/features/auth/authSlice";

/**
 * Hook to handle sign-in intent.
 * Use this to mark that the user initiated a login action
 * (email/password or social). The actual toast and clearing
 * is handled in `useAuthSignIn`.
 */
export const useAuthIntent = () => {
  const dispatch = useAppDispatch();
  const { signInIntent } = useAppSelector((state) => state.auth);

  /**
   * Mark that the user initiated sign-in
   */
  const markIntent = () => {
    dispatch(setSignInIntent(true));
  };

  return {
    signInIntent,
    markIntent,
  };
};
