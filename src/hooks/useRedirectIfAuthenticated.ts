"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./useAuth";

/**
 * Hook to redirect authenticated users away from sign-in/sign-up pages.
 *
 * Use this on sign-in and sign-up pages to prevent logged-in users
 * from accessing these pages.
 *
 * Flow:
 * 1. User is already logged in
 * 2. User tries to visit /sign-in or /sign-up
 * 3. Hook detects they're authenticated
 * 4. Redirects them to home or intended page
 *
 * @example
 * // In SignIn.tsx or SignUp.tsx
 * const SignIn = () => {
 *   useRedirectIfAuthenticated();
 *   // ... rest of component
 * };
 */
export const useRedirectIfAuthenticated = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) return;

    // If user is authenticated, redirect them away
    if (isAuthenticated) {
      const redirect = searchParams.get("redirect");
      const destination = redirect?.startsWith("/") ? redirect : "/";
      router.replace(destination);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);
};
