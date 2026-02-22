import { BackendUser } from "@/types/authTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  dbUser: BackendUser | null;
  syncing: boolean;
  syncError: boolean;
  signInIntent: boolean;
  initialized: boolean; // ← NEW: true once first auth check completes
}

const initialState: AuthState = {
  dbUser: null,
  syncing: false,
  syncError: false,
  signInIntent: false,
  initialized: false, // ← starts false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setDbUser(state, action: PayloadAction<BackendUser>) {
      state.dbUser = action.payload;
      state.syncing = false;
      state.syncError = false;
      state.initialized = true; // ← mark initialized on success
    },
    clearDbUser(state) {
      state.dbUser = null;
      state.syncing = false;
      state.syncError = false; // ← don't set error on logout
      state.initialized = true; // ← mark initialized even on logout/failure
    },
    startSync(state) {
      state.syncing = true;
      state.syncError = false;
    },
    setSignInIntent: (state, action) => {
      state.signInIntent = action.payload;
    },
  },
});

export const { setDbUser, clearDbUser, startSync, setSignInIntent } =
  authSlice.actions;
export default authSlice.reducer;
