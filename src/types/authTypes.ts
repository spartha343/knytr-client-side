export const ROLE = {
  CUSTOMER: "CUSTOMER",
  VENDOR: "VENDOR",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type RoleType = (typeof ROLE)[keyof typeof ROLE];

export interface BackendUser {
  id: string;
  firebaseUid: string;
  email?: string;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  roles: RoleType[];
}
