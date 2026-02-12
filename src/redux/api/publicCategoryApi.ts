import { publicApi } from "./publicApi";
import { tagTypes } from "../tag-types";
import { ICategory } from "@/types/category";
import { IMeta, ICategoryQueryParams, IApiResponse } from "@/types/common";

export const publicCategoryApi = publicApi.injectEndpoints({
  endpoints: (build) => ({
    getPublicCategories: build.query<
      { categories: ICategory[]; meta: IMeta },
      ICategoryQueryParams | void
    >({
      query: (arg = {}) => ({
        url: "/categories",
        method: "GET",
        params: arg,
      }),
      transformResponse: (response: IApiResponse<ICategory[]>) => ({
        categories: response.data,
        meta: response.meta!,
      }),
      providesTags: [tagTypes.category],
    }),

    getPublicCategoryById: build.query<ICategory, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "GET",
      }),
      transformResponse: (response: IApiResponse<ICategory>) => response.data,
      providesTags: [tagTypes.category],
    }),
  }),
});

export const { useGetPublicCategoriesQuery, useGetPublicCategoryByIdQuery } =
  publicCategoryApi;
