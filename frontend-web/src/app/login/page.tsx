"use client";

import {
  laravelUrl,
  requestHeader,
  setLaravelAccessToken,
} from "@/components/GlobalValues";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios, { AxiosError } from "axios";
import { FormEvent, useState } from "react";

export interface Login {
  success: boolean;
  msg: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  status: number;
}

export default function Page() {
  const [error, setError] = useState("");
  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(
        `${laravelUrl}/api/auth/login`,
        {
          email: email,
          password: password,
        },
        requestHeader()
      );
      const data: Login = res.data;
      if (!data.success) {
        setError("Email atau password salah");
        return;
      }
      setLaravelAccessToken(res.data.access_token);
      window.location.href = "/";
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.msg);
      }
    }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = e.currentTarget.elements.namedItem(
      "email"
    ) as HTMLInputElement;
    const password = e.currentTarget.elements.namedItem(
      "password"
    ) as HTMLInputElement;

    const creds = {
      email: email.value,
      password: password.value,
    };
    console.log(creds);
    login(creds.email, creds.password);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Masuk</CardTitle>
          <CardDescription>
            Masuk untuk mengelola perintah WhatsApp Bot Aran8276.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleLogin(e)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="aran8276@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" name="password" required />
            </div>
            {error ? (
              <span className="text-red-500 text-sm">{error}</span>
            ) : (
              <></>
            )}
            <Button type="submit" className="w-full">
              Masuk
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Registrasi akun sementara ini di nonaktifkan.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
