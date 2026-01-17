import axiosInstanceWithToken from "@/helpers/axios/axiosInstanceWithToken";

export const ensureDbUserExistsAndReturnProfile = async () => {
  const response = await axiosInstanceWithToken.post("/auth/sync-user");
  return response.data;
};
