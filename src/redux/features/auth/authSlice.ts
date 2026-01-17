import { BackendUser } from "@/types/authTypes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  dbUser: BackendUser | null;
  syncing: boolean;
  syncError: boolean;
}

const initialState: AuthState = {
  dbUser: null,
  syncing: false,
  syncError: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setDbUser(state, action: PayloadAction<BackendUser>) {
      state.dbUser = action.payload;
      state.syncing = false;
      state.syncError = false;
    },
    clearDbUser(state) {
      state.dbUser = null;
      state.syncing = false;
      state.syncError = true;
    },

    // TODO: please ensure syncing are started in appropriate sections
    startSync(state) {
      state.syncing = true;
      state.syncError = false;
    },
  },
});

export const { setDbUser, clearDbUser, startSync } = authSlice.actions;
export default authSlice.reducer;
