import axios from "axios";
import { laravelUrl, superAdminToken } from "./env";

export const axiosClient = axios.create({
  baseURL: laravelUrl,
  headers: {
    Authorization: `Bearer ${superAdminToken}`,
  },
});
