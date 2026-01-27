"use client";

import { useAuth } from "./useAuth";

/**
 * Legacy hook for backward compatibility.
 *
 * @deprecated Use `useAuth()` directly instead.
 * This wrapper exists to avoid breaking existing code.
 */
export const useEnsureDbUser = () => {
  return useAuth();
};
