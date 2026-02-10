import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";
import {
  ICreateAttributeInput,
  IUpdateAttributeInput,
  ICreateAttributeValueInput,
  IUpdateAttributeValueInput,
} from "@/types/attribute";

const ATTRIBUTE_URL = "/attributes";

export const attributeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Attributes
    getAllAttributes: build.query({
      query: (arg: Record<string, string | number | boolean>) => ({
        url: ATTRIBUTE_URL,
        method: "GET",
        params: arg,
      }),
      transformResponse: (response: { data: unknown; meta: unknown }) => ({
        attributes: response.data,
        meta: response.meta,
      }),
      providesTags: [tagTypes.attribute],
    }),

    getAttributeById: build.query({
      query: (id: string) => ({
        url: `${ATTRIBUTE_URL}/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.attribute],
    }),

    createAttribute: build.mutation({
      query: (data: ICreateAttributeInput) => ({
        url: ATTRIBUTE_URL,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.attribute],
    }),

    updateAttribute: build.mutation({
      query: ({ id, data }: { id: string; data: IUpdateAttributeInput }) => ({
        url: `${ATTRIBUTE_URL}/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.attribute],
    }),

    deleteAttribute: build.mutation({
      query: (id: string) => ({
        url: `${ATTRIBUTE_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.attribute],
    }),

    // Attribute Values
    getAttributeValues: build.query({
      query: (attributeId: string) => ({
        url: `${ATTRIBUTE_URL}/${attributeId}/values`,
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.attribute],
    }),

    createAttributeValue: build.mutation({
      query: (data: ICreateAttributeValueInput) => ({
        url: `${ATTRIBUTE_URL}/values`,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.attribute],
    }),

    updateAttributeValue: build.mutation({
      query: ({
        id,
        data,
      }: {
        id: string;
        data: IUpdateAttributeValueInput;
      }) => ({
        url: `${ATTRIBUTE_URL}/values/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.attribute],
    }),

    deleteAttributeValue: build.mutation({
      query: (id: string) => ({
        url: `${ATTRIBUTE_URL}/values/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.attribute],
    }),
  }),
});

export const {
  useGetAllAttributesQuery,
  useGetAttributeByIdQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,
  useGetAttributeValuesQuery,
  useCreateAttributeValueMutation,
  useUpdateAttributeValueMutation,
  useDeleteAttributeValueMutation,
} = attributeApi;
