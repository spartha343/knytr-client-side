import { combineReducers, UnknownAction } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import { RootState } from "./store";

export const appReducer = combineReducers({
  auth: authReducer,
});

const rootReducer = (state: RootState | undefined, action: UnknownAction) => {
  if (action.type === "auth/clearDbUser") {
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;
