import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

const PATHAO_URL = "/pathao";

export const pathaoApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Get all cities
    getCities: build.query({
      query: () => ({
        url: `${PATHAO_URL}/cities`, // ✅ Correct
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.pathao],
    }),

    // Get zones for a city
    getZones: build.query({
      query: (cityId: number) => ({
        url: `${PATHAO_URL}/zones/${cityId}`, // ✅ Correct
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.pathao],
    }),

    // Get areas for a zone
    getAreas: build.query({
      query: (zoneId: number) => ({
        url: `${PATHAO_URL}/areas/${zoneId}`, // ✅ Correct
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.pathao],
    }),

    // Create Pathao delivery for an order
    createDelivery: build.mutation({
      query: ({
        orderId,
        data,
      }: {
        orderId: string;
        data: {
          recipientCityId: number;
          recipientZoneId: number;
          recipientAreaId: number;
        };
      }) => ({
        url: `${PATHAO_URL}/orders/${orderId}/create-delivery`,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.order, tagTypes.pathao],
    }),

    // Save Pathao credentials (Vendor - per branch)
    saveCredentials: build.mutation({
      query: (data: {
        branchId: string;
        clientId: string;
        clientSecret: string;
        username: string;
        password: string;
        environment: "sandbox" | "production";
        webhookSecret?: string;
      }) => ({
        url: `${PATHAO_URL}/credentials`,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.pathao],
    }),

    // Register Pathao store (Vendor)
    registerStore: build.mutation({
      query: (data: {
        branchId: string;
        name: string;
        contactName: string;
        contactNumber: string;
        secondaryContact?: string;
        address: string;
        cityId: number;
        zoneId: number;
        areaId: number;
      }) => ({
        url: `${PATHAO_URL}/stores/register`,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.pathao],
    }),

    // Get credentials by branch ID (Vendor)
    getCredentialsByBranch: build.query({
      query: (branchId: string) => ({
        url: `${PATHAO_URL}/credentials/${branchId}`,
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.pathao],
    }),
  }),
});

export const {
  useGetCitiesQuery,
  useGetZonesQuery,
  useGetAreasQuery,
  useCreateDeliveryMutation,
  useSaveCredentialsMutation,
  useGetCredentialsByBranchQuery,
  useRegisterStoreMutation,
} = pathaoApi;
