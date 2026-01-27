"use client";

import { useEffect, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase.config";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  clearDbUser,
  setDbUser,
  startSync,
} from "@/redux/features/auth/authSlice";
import { ensureDbUserExistsAndReturnProfile } from "@/services/auth.service";

/**
 * Master auth hook that handles Firebase auth state and backend sync.
 *
 * This is the SINGLE SOURCE OF TRUTH for auth state.
 * Other hooks should use this instead of duplicating logic.
 *
 * Flow:
 * 1. Monitors Firebase auth state
 * 2. When user logs in, syncs with backend
 * 3. Stores user in Redux
 * 4. Handles errors gracefully
 *
 * @returns Auth state and user information
 */
export const useAuth = () => {
  const [firebaseUser, firebaseLoading] = useAuthState(auth);
  const { dbUser, syncing, syncError } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Track which user we've synced to prevent duplicate API calls
  const syncedUid = useRef<string | null>(null);

  useEffect(() => {
    // Still checking Firebase auth
    if (firebaseLoading) {
      return;
    }

    // User logged out
    if (!firebaseUser) {
      syncedUid.current = null;
      dispatch(clearDbUser());
      return;
    }

    // Already synced this user? Skip
    if (syncedUid.current === firebaseUser.uid) {
      return;
    }

    // Already syncing? Skip
    if (syncing) {
      return;
    }

    // Already have dbUser for this Firebase user? Mark as synced
    if (dbUser && dbUser.firebaseUid === firebaseUser.uid) {
      syncedUid.current = firebaseUser.uid;
      return;
    }

    // Need to sync with backend
    dispatch(startSync());

    ensureDbUserExistsAndReturnProfile()
      .then((response) => {
        dispatch(setDbUser(response.data));
        syncedUid.current = firebaseUser.uid;
      })
      .catch((error) => {
        console.error("Backend sync failed:", error);
        syncedUid.current = null;
        dispatch(clearDbUser());
      });
  }, [firebaseUser, firebaseLoading, dbUser, syncing, dispatch]);

  return {
    // Firebase state
    firebaseUser,
    firebaseLoading,

    // Backend state
    dbUser,
    syncing,
    syncError,

    // Computed states
    isAuthenticated: !!firebaseUser && !!dbUser,
    isLoading: firebaseLoading || syncing,
  };
};
