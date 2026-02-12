import axios from "axios";
import { getBaseUrl } from "../config/envConfig";

const axiosPublicInstance = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosPublicInstance;
