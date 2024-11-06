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
import axios, { AxiosError } from "axios";
import {
  FormInputs,
  laravelUrl,
  requestHeader,
} from "@/components/GlobalValues";
import { useState } from "react";
import { useRouter } from "next/navigation";

export interface Response {
  success: boolean;
  msg: string;
  callback: Callback;
  status: number;
}

export interface Callback {
  id: string;
  case: string;
  reply: string;
}

const formSchema = z.object({
  case: z.string().nonempty("Perintah tidak boleh kosong"),
  reply: z.string().nonempty("Pesan jawaban tidak boleh kosong"),
});

export default function Page() {
  const [error, setError] = useState("");
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      case: "",
      reply: "",
    },
  });

  const postData = async (formData: FormInputs) => {
    try {
      const res = await axios.post(
        `${laravelUrl}/api/responses/create`,
        formData,
        requestHeader()
      );
      const data: Response = res.data;
      if (!data.success) {
        setError("Gagal menambahkan data");
        return;
      }
      router.replace("/");
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      postData(values);
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl mx-auto py-10"
      >
        <div className="flex justify-center text-center">
          <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            Form Tambah Input WhatsApp Bot
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
          <Button type="submit">Tambahkan</Button>
          <Link href="/">
            <Button variant="outline" type="button">
              Kembali
            </Button>
          </Link>
        </div>
      </form>
    </Form>
  );
}
