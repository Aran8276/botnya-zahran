import { AxiosError } from "axios";
import { axiosClient } from "../../config/axios";

export const getAdmin = async () => {
  try {
    const res = await axiosClient.get(`/api/admin/get-detail`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error);
    }
    console.log(error);
  }
};

const getGroup = async () => {
  try {
    const res = await axiosClient.get(`/api/group/get-groups`);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error);
    }
    console.log(error);
  }
};
