import { configureStore } from "@reduxjs/toolkit";
import rootReducer, { appReducer } from "./rootReducer";
import { baseApi } from "./api/baseApi";
import { publicApi } from "./api/publicApi";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .concat(publicApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
