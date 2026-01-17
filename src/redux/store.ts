import { configureStore } from "@reduxjs/toolkit";
import rootReducer, { appReducer } from "./rootReducer";

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
