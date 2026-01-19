import { combineReducers, UnknownAction } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import { baseApi } from "./api/baseApi";

export const appReducer = combineReducers({
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer, // mount API reducer here
});

const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: UnknownAction,
) => {
  if (action.type === "auth/clearDbUser") {
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;
