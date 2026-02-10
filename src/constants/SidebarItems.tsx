import type { MenuProps } from "antd";
import {
  ShoppingCartOutlined,
  ProfileOutlined,
  AppstoreOutlined,
  TableOutlined,
  UserAddOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { ROLE, RoleType } from "@/types/authTypes";

export const sidebarItems = (roles: RoleType[]): MenuProps["items"] => {
  // Items accessible by any logged-in user
  const commonItems: MenuProps["items"] = [
    {
      label: "Settings",
      key: "settings",
      icon: <ProfileOutlined />,
      children: [
        {
          label: <Link href="/dashboard/profile">Account Profile</Link>,
          key: "/dashboard/profile",
        },
        {
          label: <Link href="/dashboard/change-password">Change Password</Link>,
          key: "/dashboard/change-password",
        },
      ],
    },
    {
      label: <Link href="/dashboard/request-role">Request Role</Link>,
      key: "/dashboard/request-role",
      icon: <UserAddOutlined />,
    },
  ];

  //  Customer-only items
  const customerItems: MenuProps["items"] = [
    {
      label: <Link href="/dashboard/cart">Cart</Link>,
      key: "/dashboard/cart",
      icon: <ShoppingCartOutlined />,
    },
    {
      label: <Link href="/dashboard/orders">Orders</Link>,
      key: "/dashboard/orders",
      icon: <TableOutlined />,
    },
  ];

  // Vendor-only items
  const vendorItems: MenuProps["items"] = [
    {
      label: <Link href="/dashboard/stores">Stores</Link>,
      key: "/dashboard/stores",
      icon: <AppstoreOutlined />,
    },
    {
      label: <Link href="/dashboard/add-product">Add Product</Link>,
      key: "/dashboard/add-product",
      icon: <TableOutlined />,
    },
  ];

  //  Admin-only items
  const adminItems: MenuProps["items"] = [
    {
      label: (
        <Link href="/dashboard/manage-role-requests">Manage Role Requests</Link>
      ),
      key: "/dashboard/manage-role-requests",
      icon: <TableOutlined />,
    },
    {
      label: <Link href="/dashboard/categories">Categories</Link>, // ADD THIS
      key: "/dashboard/categories",
      icon: <TagsOutlined />,
    },
    {
      label: <Link href="/dashboard/all-stores">All Stores</Link>,
      key: "/dashboard/all-stores",
      icon: <TableOutlined />,
    },
    {
      label: <Link href="/dashboard/all-branches">All Branches</Link>,
      key: "/dashboard/all-branches",
      icon: <TableOutlined />,
    },
  ];

  // Super Admin-only items
  const superAdminItems: MenuProps["items"] = [
    {
      label: <Link href="/dashboard/manage-admins">Manage Admins</Link>,
      key: "/dashboard/manage-admins",
      icon: <TableOutlined />,
    },
    {
      label: <Link href="/dashboard/manage-users">Manage Users</Link>,
      key: "/dashboard/manage-users",
      icon: <TableOutlined />,
    },
  ];

  //  Merge sidebar items based on roles
  let mergedItems: MenuProps["items"] = [...commonItems];

  if (roles?.includes(ROLE.CUSTOMER)) mergedItems.push(...customerItems);
  if (roles?.includes(ROLE.VENDOR)) mergedItems.push(...vendorItems);
  if (roles?.includes(ROLE.ADMIN)) mergedItems.push(...adminItems);
  if (roles?.includes(ROLE.SUPER_ADMIN)) mergedItems.push(...superAdminItems);

  // Optional: remove duplicates by key
  const keys = new Set<string>();
  mergedItems = mergedItems.filter((item) => {
    if (!item?.key) return true;
    if (keys.has(item.key.toString())) return false;
    keys.add(item.key.toString());
    return true;
  });

  return mergedItems;
};
