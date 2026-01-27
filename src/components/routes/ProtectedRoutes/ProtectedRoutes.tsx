"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { RoleType } from "@/types/authTypes";

interface IProtectedRoute {
  children: ReactNode;
  requiredRoles?: RoleType[];
}

/**
 * Protected Route Wrapper
 *
 * Ensures user is authenticated and has required roles before rendering children.
 * Redirects to sign-in if not authenticated.
 */
const ProtectedRoutes = ({ children, requiredRoles }: IProtectedRoute) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, dbUser } = useAuth();

  // Track if we're on the client to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted flag on client-side only

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Wait for client-side mounting and auth check
    if (!isMounted || isLoading) return;

    // Not authenticated -> redirect to sign-in with return URL
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      router.replace(`/sign-in?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Check role requirements
    if (requiredRoles && requiredRoles.length > 0 && dbUser) {
      const userRoles = dbUser.roles || [];
      const hasRequiredRole = requiredRoles.some((role) =>
        userRoles.includes(role),
      );

      if (!hasRequiredRole) {
        router.replace("/unauthorized");
      }
    }
  }, [isMounted, isLoading, isAuthenticated, requiredRoles, dbUser, router]);

  // During SSR or initial client render, show nothing
  // This prevents hydration mismatch
  if (!isMounted || isLoading) {
    return null;
  }

  // Not authenticated - don't render (redirect happening)
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated and authorized - render children
  return <>{children}</>;
};

export default ProtectedRoutes;
