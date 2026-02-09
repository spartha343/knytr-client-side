import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";
import { ICreateBranchInput, IUpdateBranchInput } from "@/types/branch";

const BRANCH_URL = "/branches";

export const branchApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Create branch
    createBranch: build.mutation({
      query: (data: ICreateBranchInput) => ({
        url: BRANCH_URL,
        method: "POST",
        data: data,
      }),
      invalidatesTags: [tagTypes.branch],
    }),

    // Get all branches (Admin)
    getAllBranches: build.query({
      query: (arg: Record<string, string | number | boolean>) => ({
        url: BRANCH_URL,
        method: "GET",
        params: arg,
      }),
      transformResponse: (response: {
        data: unknown;
        meta: { page: number; limit: number; total: number };
      }) => {
        return {
          branches: response.data,
          meta: response.meta,
        };
      },
      providesTags: [tagTypes.branch],
    }),

    // Get branches by store ID
    getBranchesByStore: build.query({
      query: ({
        storeId,
        ...params
      }: {
        storeId: string;
        [key: string]: string | number | boolean;
      }) => ({
        url: `${BRANCH_URL}/store/${storeId}`,
        method: "GET",
        params: params,
      }),
      transformResponse: (response: {
        data: unknown;
        meta: { page: number; limit: number; total: number };
      }) => {
        return {
          branches: response.data,
          meta: response.meta,
        };
      },
      providesTags: [tagTypes.branch],
    }),

    // Get branch by ID
    getBranchById: build.query({
      query: (id: string) => ({
        url: `${BRANCH_URL}/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.branch],
    }),

    // Update branch
    updateBranch: build.mutation({
      query: ({ id, data }: { id: string; data: IUpdateBranchInput }) => ({
        url: `${BRANCH_URL}/${id}`,
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: [tagTypes.branch],
    }),

    // Delete branch
    deleteBranch: build.mutation({
      query: (id: string) => ({
        url: `${BRANCH_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.branch],
    }),
  }),
});

export const {
  useCreateBranchMutation,
  useGetAllBranchesQuery,
  useGetBranchesByStoreQuery,
  useGetBranchByIdQuery,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
} = branchApi;
