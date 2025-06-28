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
import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/spinner";
import { CloudUpload, Paperclip, Trash2 } from "lucide-react";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/extension/file-upload";
import { RootState } from "@/lib/store";
import { useDispatch, useSelector } from "react-redux";
import {
  resetState,
  setError,
  setFiles,
  setImageDeletable,
  setImageDeleteIsLoading,
  setImages,
  setIsLoading,
  setLoaded,
} from "@/lib/features/Edit/editSlice";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { DeleteManagePictureType } from "@/components/types/type";

const formSchema = z.object({
  case: z.string().nonempty("Perintah tidak boleh kosong"),
  reply: z.string().optional().nullish(),
  image: z.string().optional(),
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
  images?: string;
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
  const { id } = use(params);
  const state = useSelector((state: RootState) => state.edit);
  const dispatch = useDispatch();

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

  const fetchInputs = async () => {
    dispatch(setLoaded(false));
    try {
      const res = await axios.get(
        `${laravelUrl}/api/responses/response/${id}`,
        requestHeader()
      );
      const data: GetResponse = res.data;
      if (data.success) {
        console.log(data.response.images);
        form.reset({
          case: data.response.case,
          reply: data.response.reply,
        });
        if (data.response.images && data.response.images.length > 0) {
          dispatch(setImageDeletable(true));
          dispatch(setImages(JSON.parse(data.response.images)));
        }
        return;
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
    } finally {
      dispatch(setLoaded(true));
    }
  };

  const postData = async (formData: FormInputs) => {
    dispatch(setIsLoading(true));
    try {
      const formDataObject = new FormData();
      formDataObject.append("case", formData.case);

      if (!formData.reply && !formData.image && !state.imageDeletable) {
        toast("Terjadi kesalahan (salah satu reply atau images harus teriisi)");
        return;
      }

      if (formData.reply) {
        formDataObject.append("reply", formData.reply);
      }

      if (state.files && state.files?.length > 0) {
        for (let i = 0; i < state.files.length; i++) {
          formDataObject.append("images[]", state.files[i]);
        }
      }

      const res = await axios.post(
        `${laravelUrl}/api/responses/response/${id}`,
        formDataObject,
        requestHeader(true)
      );
      const data: Response = res.data;
      if (!data.success) {
        dispatch(setError("Gagal mengedit data"));
        return;
      }
      router.back();
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const clearImages = async () => {
    dispatch(setImageDeleteIsLoading(true));
    try {
      const res = await axios.delete(
        `${laravelUrl}/api/responses/response/${id}/images`,
        requestHeader()
      );

      const data: DeleteManagePictureType = res.data;

      if (!data.success) {
        toast("Gagal mengedit data");
        return;
      }

      dispatch(setImageDeletable(false));
      toast("Gambar berhasil dihapus!");
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
    } finally {
      dispatch(setImageDeleteIsLoading(false));
    }
  };

  useEffect(() => {
    console.log(state);
  }, [state]);

  useEffect(() => {
    dispatch(resetState());
    fetchInputs();
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const fileExists = state.files ? true : false;

    console.log(state.imageDeletable);
    console.log(fileExists);
    const allowed = !state.imageDeletable !== !fileExists;
    try {
      if (!values.reply) {
        if (!allowed) {
          toast("Salah satu Pesan Teks atau Pesan Gambar harus diisi!");
          return;
        }
      }
      const data = {
        ...values,
        image: state.files,
      };
      postData(data);
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <>
      <AuthenticatedLayout breadcrumbEditId={id}>
        {state.loaded ? (
          <div className="p-6">
            <Form {...form}>
              <div className="flex items-center justify-between w-full">
                <h2 className="flex justify-start scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  Edit Perintah
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
                              value={field.value ?? ""}
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
                              value={state.files}
                              onValueChange={(e) => dispatch(setFiles(e))}
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
                                {state.files &&
                                  state.files.length > 0 &&
                                  state.files.map((file, i) => (
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

                    {state.imageDeletable && (
                      <div className="flex flex-col space-y-4 py-4">
                        {state.images.map((item, index) => {
                          return (
                            <Card className="w-fit p-4" key={index}>
                              <Image
                                src={`${laravelUrl}/storage/${item}`}
                                width={240}
                                height={160}
                                alt="Image"
                                key={index}
                                className="rounded-xl"
                              />
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <div>
                  {state.error ? (
                    <span className="text-red-500 text-sm">{state.error}</span>
                  ) : (
                    <></>
                  )}
                </div>

                <div className="flex flex-col md:flex-row space-y-3 md:space-x-3">
                  {state.isLoading ? (
                    <Button disabled>
                      <LoadingSpinner />
                    </Button>
                  ) : (
                    <Button className="px-8" type="submit">
                      Edit
                    </Button>
                  )}

                  {state.imageDeletable && (
                    <>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="secondary"
                            className="bg-yellow-300 hover:bg-yellow-400"
                            type="button"
                          >
                            Hapus Semua Gambar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-xl lg:mx-auto lg:w-auto">
                          <DialogHeader>
                            <DialogTitle>Apakah anda yakin?</DialogTitle>
                            <DialogDescription className="py-4">
                              Permintaan ini tidak bisa di kembalikan (alias di
                              undo), data anda akan selamanya dihapus. Apakah
                              anda yakin?
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <div className="flex space-x-3">
                              <>
                                {state.imageDeleteIsLoading ? (
                                  <Button variant="destructive" disabled>
                                    <LoadingSpinner />
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={clearImages}
                                    variant="destructive"
                                  >
                                    <Trash2 />
                                    <span>Hapus</span>
                                  </Button>
                                )}
                              </>

                              <DialogClose asChild>
                                <Button variant="outline">Tutup</Button>
                              </DialogClose>
                            </div>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                  <Button onClick={router.back} variant="outline" type="button">
                    Kembali
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        ) : (
          <div className="flex justify-center items-center h-screen">
            <LoadingSpinner isForPage />
          </div>
        )}
      </AuthenticatedLayout>
    </>
  );
}
