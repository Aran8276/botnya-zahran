"use client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FormInputs,
  laravelUrl,
  requestHeader,
} from "@/components/GlobalValues";
import axios, { AxiosError } from "axios";
import LoadingSpinner from "@/components/spinner";

const formSchema = z.object({
  case: z.string().nonempty("Perintah tidak boleh kosong"),
  reply: z.string().nonempty("Pesan jawaban tidak boleh kosong"),
});

export interface GetResponse {
  success: boolean;
  msg: string;
  response: Response;
  status: number;
}

export interface Response {
  id: string;
  case: string;
  reply: string;
  created_at: Date;
  updated_at: Date;
}

export interface Response {
  success: boolean;
  msg: string;
  id: string;
  callback: Callback;
  status: number;
}

export interface Callback {
  case: string;
  reply: string;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      case: "",
      reply: "",
    },
  });

  const fetchInputs = async () => {
    setLoaded(false);
    try {
      const res = await axios.get(
        `${laravelUrl}/api/responses/response/${id}`,
        requestHeader()
      );
      const data: GetResponse = res.data;
      if (data.success) {
        form.reset({
          case: data.response.case,
          reply: data.response.reply,
        });
        return;
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
    } finally {
      setLoaded(true);
    }
  };

  const postData = async (formData: FormInputs) => {
    setIsLoading(true);
    try {
      const res = await axios.put(
        `${laravelUrl}/api/responses/response/${id}`,
        formData,
        requestHeader()
      );
      const data: Response = res.data;
      if (!data.success) {
        setError("Gagal mengedit data");
        return;
      }
      router.replace("/");
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInputs();
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      postData(values);
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  const { id } = use(params);
  return (
    <>
      {loaded ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 max-w-3xl mx-6 lg:mx-auto py-10"
          >
            <div className="flex justify-center text-center">
              <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                Form Edit Input WhatsApp Bot {id}
              </h2>
            </div>
            <FormField
              control={form.control}
              name="case"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perintah</FormLabel>
                  <FormControl>
                    <Input placeholder="!hello" type="text" {...field} />
                  </FormControl>
                  <FormDescription>
                    Perintah yang akan dicari atau didengar oleh bot.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reply"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pesan Jawaban</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ini adalah pesan Hello World!"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Pesan yang akan dikirim oleh bot setelah menemukan perintah
                    tersebut.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              {error ? (
                <span className="text-red-500 text-sm">{error}</span>
              ) : (
                <></>
              )}
            </div>

            <div className="flex space-x-3">
              {isLoading ? (
                <Button disabled>
                  <LoadingSpinner />
                </Button>
              ) : (
                <Button type="submit">Editkan</Button>
              )}
              <Link href="/">
                <Button variant="outline" type="button">
                  Kembali
                </Button>
              </Link>
            </div>
          </form>
        </Form>
      ) : (
        <div className="flex justify-center items-center h-screen scale-[2.25]">
          <LoadingSpinner />
        </div>
      )}
    </>
  );
}
