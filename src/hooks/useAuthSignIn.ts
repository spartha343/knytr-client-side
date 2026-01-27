"use client";

import { useAuth } from "./useAuth";
import { useSignInNotification } from "./useSignInNotification";

/**
 * Hook for sign-in/sign-up pages.
 *
 * Combines:
 * - Auth state management (via useAuth)
 * - Sign-in notifications and redirects (via useSignInNotification)
 *
 * Usage:
 * const { user } = useAuthSignIn();
 */
export const useAuthSignIn = () => {
  // Get auth state from master hook
  const { firebaseUser, isAuthenticated, isLoading } = useAuth();

  // Handle notifications and redirects
  useSignInNotification();

  return {
    user: firebaseUser,
    isAuthenticated,
    isLoading,
  };
};
