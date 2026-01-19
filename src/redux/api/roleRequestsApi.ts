import { RoleType } from "@/types/authTypes";
import { baseApi } from "./baseApi";
import { tagTypes } from "../tag-types";

export interface RoleRequest {
  id: string;
  userId: string;
  roleId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;

  user: {
    id: string;
    email: string;
    firebaseUid: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };

  role: {
    id: string;
    name: RoleType;
    description?: string;
  };
}

export interface GetRoleRequestsParams {
  page: number;
  limit: number;
  searchTerm?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetRoleRequestsResponse {
  meta: {
    total: number;
    page: number;
    limit: number;
  };
  data: RoleRequest[];
}

export const roleRequestsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoleRequests: builder.query<
      GetRoleRequestsResponse,
      GetRoleRequestsParams
    >({
      query: (params) => ({
        url: "/roles/requests",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.roleRequests],
    }),

    updateRoleRequest: builder.mutation<
      void,
      { id: string; status: "APPROVED" | "REJECTED" }
    >({
      query: ({ id, status }) => ({
        url: `/roles/requests/${id}`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: [tagTypes.roleRequests],
    }),
  }),
});

export const { useGetRoleRequestsQuery, useUpdateRoleRequestMutation } =
  roleRequestsApi;
