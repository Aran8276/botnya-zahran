"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GuestLoginSchema, UserLoginSchema } from "@/lib/schemas";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("account");

  const userForm = useForm<z.infer<typeof UserLoginSchema>>({
    resolver: zodResolver(UserLoginSchema),
  });

  const guestForm = useForm<z.infer<typeof GuestLoginSchema>>({
    resolver: zodResolver(GuestLoginSchema),
  });

  const onUserSubmit = async (data: z.infer<typeof UserLoginSchema>) => {
    setError(null);
    const result = await signIn("credentials", {
      ...data,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid username or password");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const onGuestSubmit = async (data: z.infer<typeof GuestLoginSchema>) => {
    setError(null);
    const result = await signIn("credentials", {
      ...data,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid Guest Identifier");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="guest">Guest</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                <form
                  className="mt-6"
                  onSubmit={userForm.handleSubmit(onUserSubmit)}
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center text-center">
                      <h1 className="text-2xl font-bold">Welcome back</h1>
                      <p className="text-muted-foreground text-balance">
                        Login to your account
                      </p>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="your-username"
                        {...userForm.register("username")}
                      />
                      {userForm.formState.errors.username && (
                        <p className="text-sm text-red-600">
                          {userForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        {...userForm.register("password")}
                      />
                      {userForm.formState.errors.password && (
                        <p className="text-sm text-red-600">
                          {userForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    {error && activeTab === "account" && (
                      <p className="text-sm text-red-600">{error}</p>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={userForm.formState.isSubmitting}
                    >
                      {userForm.formState.isSubmitting
                        ? "Logging in..."
                        : "Login"}
                    </Button>
                    <div className="text-center text-sm">
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/register"
                        className="underline underline-offset-4 hover:text-primary"
                      >
                        Sign up
                      </Link>
                    </div>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="guest">
                <form
                  className="mt-6"
                  onSubmit={guestForm.handleSubmit(onGuestSubmit)}
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center text-center">
                      <h1 className="text-2xl font-bold">Guest Login</h1>
                      <p className="text-muted-foreground text-balance">
                        Login with your guest identifier
                      </p>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="serializedId">Guest Identifier</Label>
                      <Input
                        id="serializedId"
                        type="text"
                        placeholder="your-guest-id"
                        {...guestForm.register("serializedId")}
                      />
                      {guestForm.formState.errors.serializedId && (
                        <p className="text-sm text-red-600">
                          {guestForm.formState.errors.serializedId.message}
                        </p>
                      )}
                    </div>
                    {error && activeTab === "guest" && (
                      <p className="text-sm text-red-600">{error}</p>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={guestForm.formState.isSubmitting}
                    >
                      {guestForm.formState.isSubmitting
                        ? "Logging in..."
                        : "Login as Guest"}
                    </Button>
                    <div className="text-center text-sm">
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/register"
                        className="underline underline-offset-4 hover:text-primary"
                      >
                        Sign up
                      </Link>
                    </div>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
          <div className="bg-muted relative hidden md:block">
            <div className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale bg-gray-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
