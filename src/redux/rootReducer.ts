import { combineReducers, UnknownAction } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import { baseApi } from "./api/baseApi";
import { publicApi } from "./api/publicApi";

export const appReducer = combineReducers({
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer,
  [publicApi.reducerPath]: publicApi.reducer,
});

const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: UnknownAction,
) => {
  if (action.type === "auth/clearDbUser") {
    return appReducer(
      {
        ...state,
        auth: undefined, // Clear only auth
      },
      action,
    );
  }

  return appReducer(state, action);
};

export default rootReducer;
