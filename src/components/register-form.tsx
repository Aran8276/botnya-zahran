"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GuestRegisterSchema, UserRegisterSchema } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("guest");

  const userForm = useForm<z.infer<typeof UserRegisterSchema>>({
    resolver: zodResolver(UserRegisterSchema),
  });

  const guestForm = useForm<z.infer<typeof GuestRegisterSchema>>({
    resolver: zodResolver(GuestRegisterSchema),
  });

  const onUserSubmit = async (data: z.infer<typeof UserRegisterSchema>) => {
    setError(null);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Something went wrong");
        return;
      }
      toast.success("Registration successful! Please log in.");
      router.push("/login");
    } catch (err) {
      setError("Failed to register");
    }
  };

  const onGuestSubmit = async (data: z.infer<typeof GuestRegisterSchema>) => {
    setError(null);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Something went wrong");
        return;
      }
      toast.success(
        "Guest registration successful! You can now upgrade to a full account."
      );
      setActiveTab("account");
    } catch (err) {
      setError("Failed to register as guest");
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
                <TabsTrigger value="guest">Guest</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>
              <TabsContent value="guest">
                <form
                  className="mt-6"
                  onSubmit={guestForm.handleSubmit(onGuestSubmit)}
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center text-center">
                      <h1 className="text-2xl font-bold">Guest Registration</h1>
                      <p className="text-muted-foreground text-balance">
                        Create a temporary guest account
                      </p>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="guestSerializedId">
                        Guest Identifier
                      </Label>
                      <Input
                        id="guestSerializedId"
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
                        ? "Registering..."
                        : "Register as Guest"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="account">
                <form
                  className="mt-6"
                  onSubmit={userForm.handleSubmit(onUserSubmit)}
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center text-center">
                      <h1 className="text-2xl font-bold">Create an account</h1>
                      <p className="text-muted-foreground text-balance">
                        Upgrade your guest account
                      </p>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="userSerializedId">Guest Identifier</Label>
                      <Input
                        id="userSerializedId"
                        type="text"
                        placeholder="your-guest-id"
                        {...userForm.register("serializedId")}
                      />
                      {userForm.formState.errors.serializedId && (
                        <p className="text-sm text-red-600">
                          {userForm.formState.errors.serializedId.message}
                        </p>
                      )}
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
                      <Label htmlFor="name">Name (Optional)</Label>
                      <Input
                        id="name"
                        type="text"
                        {...userForm.register("name")}
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="password">Password</Label>
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
                        ? "Registering..."
                        : "Register"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Sign in
                </Link>
              </div>
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
