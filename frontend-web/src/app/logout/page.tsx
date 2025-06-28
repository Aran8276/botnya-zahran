"use client";

import {
  deleteLaravelAccessToken,
  laravelUrl,
  requestHeader,
} from "@/components/GlobalValues";
import axios, { AxiosError } from "axios";
import React, { useEffect } from "react";

export default function Page() {
  const logout = async () => {
    try {
      await axios.delete(`${laravelUrl}/api/destroy-token`, requestHeader());
      deleteLaravelAccessToken();
      window.location.href = "/login";
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
      deleteLaravelAccessToken();
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    logout();
  }, []);

  return <></>;
}
