import { publicApi } from "./publicApi";
import { tagTypes } from "../tag-types";
import { IStore } from "@/types/store";
import { IMeta, IStoreQueryParams, IApiResponse } from "@/types/common";

export const publicStoreApi = publicApi.injectEndpoints({
  endpoints: (build) => ({
    getPublicStores: build.query<
      { stores: IStore[]; meta: IMeta },
      IStoreQueryParams | void
    >({
      query: (arg = {}) => ({
        url: "/stores",
        method: "GET",
        params: arg,
      }),
      transformResponse: (response: IApiResponse<IStore[]>) => ({
        stores: response.data,
        meta: response.meta!,
      }),
      providesTags: [tagTypes.store],
    }),

    getPublicStoreById: build.query<IStore, string>({
      query: (idOrSlug) => ({
        url: `/stores/${idOrSlug}`,
        method: "GET",
      }),
      transformResponse: (response: IApiResponse<IStore>) => response.data,
      providesTags: [tagTypes.store],
    }),
  }),
});

export const { useGetPublicStoresQuery, useGetPublicStoreByIdQuery } =
  publicStoreApi;
