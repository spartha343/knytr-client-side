"use client";

import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase.config";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  startSync,
  setDbUser,
  clearDbUser,
} from "@/redux/features/auth/authSlice";
import { ensureDbUserExistsAndReturnProfile } from "@/services/auth.service";

export const useEnsureDbUser = () => {
  const [firebaseUser, firebaseLoading] = useAuthState(auth);
  const { dbUser, syncing, syncError } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Still checking Firebase auth
    if (firebaseLoading) return;

    // User logged out → clear Redux
    if (!firebaseUser) {
      dispatch(clearDbUser());
      return;
    }

    // Already synced or syncing → do nothing
    if (dbUser || syncing || syncError) return;

    // Fetch backend profile
    dispatch(startSync());
    ensureDbUserExistsAndReturnProfile()
      .then((res) => dispatch(setDbUser(res.data)))
      .catch(() => dispatch(clearDbUser()));
  }, [firebaseUser, firebaseLoading, dbUser, syncing, dispatch, syncError]);

  return {
    firebaseUser,
    firebaseLoading,
    dbUser,
    syncing,
  };
};
