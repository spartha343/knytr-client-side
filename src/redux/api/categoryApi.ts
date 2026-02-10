import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";
import { ICreateCategoryInput, IUpdateCategoryInput } from "@/types/category";

const CATEGORY_URL = "/categories";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Create category (Admin only)
    createCategory: build.mutation({
      query: (data: ICreateCategoryInput) => ({
        url: CATEGORY_URL,
        method: "POST",
        data: data,
      }),
      invalidatesTags: [tagTypes.category],
    }),

    // Get all categories (Public)
    getAllCategories: build.query({
      query: (arg: Record<string, string | number | boolean>) => ({
        url: CATEGORY_URL,
        method: "GET",
        params: arg,
      }),
      transformResponse: (response: {
        data: unknown;
        meta: { page: number; limit: number; total: number };
      }) => {
        return {
          categories: response.data,
          meta: response.meta,
        };
      },
      providesTags: [tagTypes.category],
    }),

    // Get category by ID
    getCategoryById: build.query({
      query: (id: string) => ({
        url: `${CATEGORY_URL}/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.category],
    }),

    // Get category children
    getCategoryChildren: build.query({
      query: (id: string) => ({
        url: `${CATEGORY_URL}/${id}/children`,
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.category],
    }),

    // Update category (Admin only)
    updateCategory: build.mutation({
      query: ({ id, data }: { id: string; data: IUpdateCategoryInput }) => ({
        url: `${CATEGORY_URL}/${id}`,
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: [tagTypes.category],
    }),

    // Delete category (Admin only)
    deleteCategory: build.mutation({
      query: (id: string) => ({
        url: `${CATEGORY_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.category],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetCategoryChildrenQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
