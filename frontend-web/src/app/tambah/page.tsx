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
import axios, { AxiosError } from "axios";
import {
  FormInputs,
  laravelUrl,
  requestHeader,
} from "@/components/GlobalValues";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/spinner";
import { CloudUpload, Paperclip } from "lucide-react";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/extension/file-upload";

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
  reply: z.string().optional(),
  image: z.string().optional(),
});

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[] | null>(null);
  const router = useRouter();

  const dropZoneConfig = {
    maxFiles: 2,
    maxSize: 1024 * 1024 * 4,
    multiple: true,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      case: "",
      reply: "",
    },
  });

  const postData = async (formData: FormInputs) => {
    setIsLoading(true);
    try {
      const formDataObject = new FormData();
      formDataObject.append("case", formData.case);

      if (!formData.reply && !formData.image) {
        toast("Terjadi kesalahan (salah satu reply atau images harus teriisi)");
        return;
      }

      if (formData.reply) {
        formDataObject.append("reply", formData.reply);
      }

      if (files && files?.length > 0) {
        for (let i = 0; i < files.length; i++) {
          formDataObject.append("image[]", files[i]);
        }
      }

      const res = await axios.post(
        `${laravelUrl}/api/responses/create`,
        formDataObject,
        requestHeader(true)
      );
      const data: Response = res.data;
      if (!data.success) {
        setError("Gagal menambahkan data");
        return;
      }
      router.back();
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!values.reply && (files?.length == 0 || !files)) {
        toast("Salah satu Pesan Teks atau Pesan Gambar harus diisi!");
        return;
      }

      // Ensure case starts with a single '!'
      let caseValue = values.case;
      if (caseValue) {
        caseValue = caseValue.replace(/^!+/, ""); // Remove all leading '!'
        caseValue = "!" + caseValue; // Add a single leading '!'
      }

      // Ensure reply does not start with any '!'
      let replyValue = values.reply;
      if (replyValue) {
        replyValue = replyValue.replace(/^!+/, ""); // Remove all leading '!'
      }

      const data = {
        ...values,
        case: caseValue,
        reply: replyValue,
        image: files,
      };

      postData(data);
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <Form {...form}>
          <div className="flex items-center justify-between w-full">
            <h2 className="flex justify-start scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Tambah Perintah
            </h2>
          </div>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-fit px-2 md:px-0 md:w-[400px] py-10"
          >
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

            <Tabs defaultValue="text" className="md:w-[400px]">
              <TabsList>
                <TabsTrigger value="text">Pesan Teks</TabsTrigger>
                <TabsTrigger value="image">Pesan Gambar</TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                <FormField
                  control={form.control}
                  name="reply"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Ini adalah pesan Hello World!"
                          className="h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Pesan yang akan dikirim oleh bot setelah menemukan
                        perintah tersebut.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent value="image">
                <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <FileUploader
                          value={files}
                          onValueChange={setFiles}
                          dropzoneOptions={dropZoneConfig}
                          className="relative bg-background rounded-lg p-2"
                        >
                          <FileInput
                            id="fileInput"
                            className="outline-dashed outline-1 outline-slate-500"
                          >
                            <div className="flex items-center justify-center flex-col p-8 w-full ">
                              <CloudUpload className="text-gray-500 w-10 h-10" />
                              <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">
                                  Klik untuk upload
                                </span>
                                &nbsp; atau drag and drop
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                PNG, JPG, JPEG
                              </p>
                            </div>
                          </FileInput>
                          <FileUploaderContent>
                            {files &&
                              files.length > 0 &&
                              files.map((file, i) => (
                                <FileUploaderItem key={i} index={i}>
                                  <Paperclip className="h-4 w-4 stroke-current" />
                                  <span className="w-[320px] line-clamp-1">
                                    {file.name}
                                  </span>
                                </FileUploaderItem>
                              ))}
                          </FileUploaderContent>
                        </FileUploader>
                      </FormControl>
                      <FormDescription>
                        Gambar yang akan dikirim oleh bot setelah menemukan
                        perintah tersebut.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div>
              {error ? (
                <span className="text-red-500 text-sm">{error}</span>
              ) : (
                <></>
              )}
            </div>
            <div className="flex flex-col md:flex-row space-y-3 md:space-x-3">
              {isLoading ? (
                <Button disabled>
                  <LoadingSpinner />
                </Button>
              ) : (
                <Button type="submit">Tambahkan</Button>
              )}

              <Button onClick={router.back} variant="outline" type="button">
                Kembali
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AuthenticatedLayout>
  );
}
