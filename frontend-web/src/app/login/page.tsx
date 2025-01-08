"use client";

import {
  laravelUrl,
  requestHeader,
  setLaravelAccessToken,
} from "@/components/GlobalValues";
import LoadingSpinner from "@/components/spinner";
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
import { FormEvent, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  GroupCheckPwResponse,
  GroupLoginResponse,
  OTPResponse,
} from "@/components/types/type";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
  setError,
  setGroupDefaultId,
  setHasPassword,
  setIsLoading,
  setTab,
} from "@/lib/features/Login/loginSlice";

export interface Login {
  success: boolean;
  msg: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  status: number;
}

interface LoginPrompt {
  otp?: string;
}

interface LoginGroup {
  groupId?: string;
  password?: string;
}

export default function Page() {
  const promptPromtRef = useRef<HTMLFormElement | null>(null);
  const param = useSearchParams();
  const state = useSelector((state: RootState) => state.login);
  const dispatch = useDispatch();

  const tabParam = param.get("tab");
  const groupParam = param.get("groupid");

  useEffect(() => {
    console.log(tabParam);
    if (!tabParam) {
      return;
    }

    if (
      tabParam == "prompt" ||
      tabParam == "group" ||
      tabParam == "admin" ||
      tabParam == "ai"
    ) {
      dispatch(setTab(tabParam));
    }

    if (groupParam) {
      dispatch(setGroupDefaultId(groupParam));
    }
  }, []);

  const onTabChange = (value: string) => {
    dispatch(setTab(value));
  };

  const handlePasswordlessLogin = async (groupId: string) => {
    try {
      const res = await axios.post(
        `${laravelUrl}/api/group/login-passwordless`,
        {
          groupUserId: groupId,
        },
        requestHeader()
      );

      const data: GroupLoginResponse = res.data;
      if (!data.success) {
        dispatch(setError(data.msg));
        dispatch(setIsLoading(false));
        throw new AxiosError(`${data.msg}`);
      }

      if (data.access_token) {
        setLaravelAccessToken(data.access_token);
      }
      window.location.replace("/group");
      return;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
        dispatch(setError(error.response?.data.msg));
        dispatch(setIsLoading(false));
      }
    }
  };

  const handleGroupPasswordedLogin = async (
    groupId: string,
    password: string
  ) => {
    try {
      const res = await axios.post(
        `${laravelUrl}/api/group/login`,
        {
          groupUserId: groupId,
          password: password,
        },
        requestHeader()
      );

      const data: GroupLoginResponse = res.data;
      if (!data.success) {
        dispatch(setError(data.msg));
        dispatch(setIsLoading(false));
        throw new AxiosError(`${data.msg}`);
      }

      if (data.access_token) {
        setLaravelAccessToken(data.access_token);
      }
      window.location.replace("/group");
      return;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
        dispatch(setError(error.response?.data.msg));
        dispatch(setIsLoading(false));
      }
    }
  };

  const login = async (email: string, password: string) => {
    dispatch(setIsLoading(true));
    try {
      const res = await axios.post(
        `${laravelUrl}/api/admin/login`,
        {
          email: email,
          password: password,
        },
        requestHeader()
      );
      const data: Login = res.data;
      if (!data.success) {
        dispatch(setError("Email atau password salah"));
        return;
      }

      if (data.access_token) {
        setLaravelAccessToken(data.access_token);
      }
      window.location.href = "/admin";
    } catch (error) {
      if (error instanceof AxiosError) {
        dispatch(setError(error.response?.data.msg));
      }
    } finally {
      dispatch(setIsLoading(false));
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
    login(creds.email, creds.password);
  };

  const promptLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(setIsLoading(true));
    const formData = new FormData(e.target as HTMLFormElement);
    const credentials: LoginPrompt = Object.fromEntries(formData);

    try {
      const res = await axios.post(
        `${laravelUrl}/api/verify-otp`,
        {
          otp: credentials.otp,
        },
        requestHeader()
      );

      const data: OTPResponse = res.data;
      if (!data.success) {
        dispatch(setError(data.msg));
        dispatch(setIsLoading(false));
        throw new AxiosError(`${data.msg}`);
      }

      if (data.access_token) {
        setLaravelAccessToken(data.access_token);
      }
      window.location.replace("/");
      return;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
        dispatch(setError(error.response?.data.msg));
        dispatch(setIsLoading(false));
      }
    }
  };

  const handleGroupLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(setIsLoading(true));

    const formData = new FormData(e.target as HTMLFormElement);
    const loginData: LoginGroup = Object.fromEntries(formData);

    const hasPassword = await checkGroupHasPw(loginData.groupId || "");

    if (!hasPassword) {
      return;
    }

    if (state.groupHasPassword) {
      handleGroupPasswordedLogin(
        loginData.groupId || "",
        loginData.password || ""
      );
      return;
    }

    dispatch(setHasPassword(true));
    dispatch(setIsLoading(false));
  };

  const checkGroupHasPw = async (groupId: string) => {
    dispatch(setIsLoading(true));
    try {
      const res = await axios.post(
        `${laravelUrl}/api/group/check-password/check`,
        {
          groupUserId: groupId,
        },
        requestHeader()
      );

      const data: GroupCheckPwResponse = res.data;

      if (!data.value) {
        handlePasswordlessLogin(groupId);
        return false;
      }

      console.log("has pw");
      return true;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
        dispatch(setError(error.response?.data.msg));
        dispatch(setIsLoading(false));
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen mx-6 lg:mx-0">
      <Tabs value={state.tab} onValueChange={onTabChange} className="w-[400px]">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="prompt">Perintah</TabsTrigger>
          <TabsTrigger value="group">Group</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="ai">
          <Card className="mx-auto flex justify-center items-center h-[365px] max-w-sm">
            <div className="flex flex-col text-center">
              <CardHeader>
                <CardTitle className="text-2xl">AI Coding</CardTitle>
                <CardDescription>
                  Masuk aplikasi untuk mengakses AI Coding.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4 w-full">
                  {state.error ? (
                    <span className="text-red-500 text-sm">{state.error}</span>
                  ) : (
                    <></>
                  )}
                  <div>
                    <Link href="/ai-coding">
                      <Button type="submit" className=" w-full">
                        Masuk
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="prompt">
          <Card className="mx-auto h-[365px] max-w-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Kelola Perintah</CardTitle>
              <CardDescription>
                Masukan kode OTP yang didapatkan dari bot untuk mengelola
                perintah.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form ref={promptPromtRef} onSubmit={promptLogin}>
                <div className="flex flex-col justify-center items-center">
                  <div className="pt-8">
                    <InputOTP
                      onComplete={() => promptPromtRef.current?.requestSubmit()}
                      name="otp"
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <div className="pt-6 w-full">
                    {state.error && (
                      <span className="text-red-500 text-sm">
                        {state.error}
                      </span>
                    )}

                    <div className="pt-4">
                      {state.isLoading ? (
                        <Button disabled className="w-full">
                          <LoadingSpinner />
                        </Button>
                      ) : (
                        <Button type="submit" className="w-full">
                          Masuk
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="group">
          <Card className="mx-auto min-h-[365px] max-w-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Group</CardTitle>
              <CardDescription>
                Silahkan masukan ID group yang telah diberikan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGroupLogin} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="id">ID Group</Label>
                  <Input
                    defaultValue={state.groupDefaultId}
                    id="id"
                    name="groupId"
                    type="text"
                    placeholder="12345678"
                    required
                  />
                </div>
                {state.groupHasPassword && (
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                    />
                  </div>
                )}

                {state.error ? (
                  <span className="text-red-500 text-sm">{state.error}</span>
                ) : (
                  <></>
                )}
                {state.isLoading ? (
                  <Button disabled className="w-full">
                    <LoadingSpinner />
                  </Button>
                ) : (
                  <Button type="submit" className="w-full">
                    Masuk
                  </Button>
                )}
              </form>
              <div className="mt-4 text-left text-sm">
                <a href="#" className="text-blue-500 underline">
                  Lupa password?
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admin">
          <Card className="mx-auto min-h-[365px] max-w-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Admin</CardTitle>
              <CardDescription>Halo admin, silahkan masuk.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => handleLogin(e)} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="toyota@calya.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    required
                  />
                </div>
                {state.error && (
                  <span className="text-red-500 text-sm">{state.error}</span>
                )}
                {state.isLoading ? (
                  <Button disabled className="w-full">
                    <LoadingSpinner />
                  </Button>
                ) : (
                  <Button type="submit" className="w-full">
                    Masuk
                  </Button>
                )}
              </form>
              <div className="mt-4 text-left text-sm">
                <a href="#" className="text-blue-500 underline">
                  Lupa password?
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
