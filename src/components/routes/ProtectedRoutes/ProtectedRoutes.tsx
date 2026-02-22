"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { RoleType } from "@/types/authTypes";
import { Spin } from "antd";

interface IProtectedRoute {
  children: ReactNode;
  requiredRoles?: RoleType[];
}

const ProtectedRoutes = ({ children, requiredRoles }: IProtectedRoute) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, isInitialized, dbUser } = useAuth();

  useEffect(() => {
    // Wait until auth is fully initialized
    if (!isInitialized || isLoading) return;

    // Not authenticated -> redirect to sign-in
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
  }, [
    isInitialized,
    isLoading,
    isAuthenticated,
    requiredRoles,
    dbUser,
    router,
  ]);

  // Show spinner while auth is initializing — never redirect prematurely
  if (!isInitialized || isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Not authenticated - don't render (redirect happening)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoutes;
