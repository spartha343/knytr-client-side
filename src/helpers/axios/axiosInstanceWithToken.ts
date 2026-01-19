import { auth } from "@/firebase/firebase.config";
import axios from "axios";
import { getBaseUrl } from "../config/envConfig";

// TODO: handle the NEXT_PUBLIC_API_BASE_URL properly
const axiosInstanceWithToken = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstanceWithToken.interceptors.request.use(
  async (config) => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstanceWithToken;
