// src/hooks/useRequestableRoles.ts
import axiosInstanceWithToken from "@/helpers/axios/axiosInstanceWithToken";
import { RoleType } from "@/types/authTypes";
import { useState, useEffect, useCallback } from "react";

interface RequestableRole {
  id: string;
  name: RoleType;
  description?: string | null;
}

export interface PreviousRoleRequest {
  id: string;
  role: RequestableRole;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
}

interface RoleResponse {
  requestableRoles: RequestableRole[];
  previousRequests: PreviousRoleRequest[];
}

export const useRequestableRolesAndPreviousRequests = () => {
  const [requestableRoles, setRequestableRoles] = useState<RequestableRole[]>(
    [],
  );
  const [previousRequests, setPreviousRequests] = useState<
    PreviousRoleRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstanceWithToken.get<{ data: RoleResponse }>(
        "/roles/requestable-roles-and-previous-requests",
      );
      setRequestableRoles(res.data.data.requestableRoles);
      setPreviousRequests(res.data.data.previousRequests);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    requestableRoles,
    previousRequests,
    loading,
    error,
    refetch: fetchData,
  };
};
