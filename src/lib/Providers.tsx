"use client";
import { store } from "@/redux/store";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import React from "react";
import { Provider } from "react-redux";
import DbUserProvider from "./DbUserProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <DbUserProvider>
        <AntdRegistry>{children}</AntdRegistry>
      </DbUserProvider>
    </Provider>
  );
};

export default Providers;
