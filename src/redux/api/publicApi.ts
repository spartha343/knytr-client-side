import { axiosPublicBaseQuery } from "@/helpers/axios/axiosPublicBaseQuery";
import { getBaseUrl } from "@/helpers/config/envConfig";
import { createApi } from "@reduxjs/toolkit/query/react";
import { tagTypesList } from "../tag-types";

// Public API - No authentication required
export const publicApi = createApi({
  reducerPath: "publicApi",
  baseQuery: axiosPublicBaseQuery({ baseUrl: getBaseUrl() }),
  endpoints: () => ({}),
  tagTypes: tagTypesList,
});
