"use client";

import { ReactNode } from "react";
import { useEnsureDbUser } from "@/hooks/useEnsureDbUser";

export default function DbUserProvider({ children }: { children: ReactNode }) {
  useEnsureDbUser();
  return <>{children}</>;
}
