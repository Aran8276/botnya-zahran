"use client";

import axios, { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  deleteLaravelAccessToken,
  laravelAccessToken,
  laravelUrl,
  requestHeader,
} from "@/components/GlobalValues";
import { toast } from "sonner";

export interface LogoutResponse {
  success: boolean;
  status: number;
  msg: string;
}

export interface DeleteResponse {
  success: boolean;
  msg: string;
  id: string;
  status: number;
}

export interface Response {
  success: boolean;
  msg: string;
  responses: ResponseElement[];
  status: number;
}

export interface ResponseElement {
  id: string;
  case: string;
  reply: string;
  created_at: Date;
  updated_at: Date;
}

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState<Response | null>();

  const deleteData = async (id: string) => {
    try {
      const res = await axios.delete(
        `${laravelUrl}/api/responses/response/${id}`,
        requestHeader()
      );
      const data: DeleteResponse = res.data;
      if (!data.success) {
        toast("Failed to delete");
        return;
      }
      fetchData();
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
    }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `${laravelUrl}/api/responses/responses`,
        requestHeader()
      );
      console.log(res.data);
      setData(res.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
    }
  };

  const logout = async () => {
    try {
      const res = await axios.get(
        `${laravelUrl}/api/auth/logout`,
        requestHeader()
      );
      const data: LogoutResponse = res.data;

      if (!data.success) {
        toast("Failed to logout");
        return;
      }

      deleteLaravelAccessToken();
      window.location.href = "/login";
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
    }
  };

  useEffect(() => {
    if (laravelAccessToken) {
      fetchData();
      setLoaded(true);
      return;
    }
    window.location.href = "/login";
  }, []);

  return (
    <>
      {loaded ? (
        <div className="space-y-8 max-w-3xl mx-auto py-10">
          <div className="flex justify-center text-center">
            <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Daftar Perintah WhatsApp Bot
            </h2>
          </div>
          <Table>
            <TableCaption className="space-x-3 py-6">
              <Link href="/tambah">
                <Button>Tambah Perintah</Button>
              </Link>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">No</TableHead>
                <TableHead className="w-[100px]">Perintah</TableHead>
                <TableHead className="w-[100px]">Pesan</TableHead>
                <TableHead className="text-center w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.responses.map((item, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell key={index + 1} className="font-medium">
                      {index + 1}.
                    </TableCell>
                    <TableCell key={item.case}> {item.case}</TableCell>
                    <TableCell key={item.reply}>
                      <span className="line-clamp-1">{item.reply}</span>
                    </TableCell>
                    <TableCell className="text-center w-full flex justify-center space-x-3">
                      <Link href={`/edit/${item.id}`}>
                        <Button variant="secondary">Edit</Button>
                      </Link>
                      <Button
                        onClick={() => deleteData(item.id)}
                        variant="destructive"
                      >
                        Hapus
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
