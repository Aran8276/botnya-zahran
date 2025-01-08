"use client";

import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserProfile from "@/components/elements/UserProfile";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/extension/file-upload";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CloudUpload, ImageIcon, Paperclip, Trash2 } from "lucide-react";
import { RootState } from "@/lib/store";
import { useDispatch, useSelector } from "react-redux";
import {
  setBotDelayEnabled,
  setBroadcastIsLoading,
  setData,
  setDataGroup,
  setDeleteLoading,
  setFiles,
  setLoaded,
  setPfpSlideshowEnabled,
  setSettingIsLoading,
  setUploadProgress,
} from "@/lib/features/Admin/adminSlice";
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
  expressUrl,
  laravelUrl,
  requestHeader,
} from "@/components/GlobalValues";
import axios, { AxiosError } from "axios";
import LoadingSpinner from "@/components/spinner";
import { FormEvent, useEffect, useRef } from "react";
import {
  ChangeAdminBroadcastResponse,
  ChangeAdminSettingsResponse,
  Datum,
  DeleteAdminBroadcastPfpSlide,
} from "@/components/types/type";
import { toast } from "sonner";
import { setFilesInDb } from "@/lib/features/Group/groupSlice";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

interface SettingFormData {
  botDelayEnabled?: string;
  botDelay?: string;
}

interface BroadcastFormData {
  pfpslideEnabled?: boolean;
  pfpSlideInterval?: string;
}

export default function Page() {
  const broadcastForm = useRef<HTMLFormElement | null>(null);
  const settingForm = useRef<HTMLFormElement | null>(null);
  const state = useSelector((state: RootState) => state.admin);
  const dispatch = useDispatch();

  const fetchData = async () => {
    dispatch(setLoaded(false));
    try {
      const res = await axios.get(`${laravelUrl}/api/admin`, requestHeader());
      console.log(res.data);

      dispatch(setData(res.data));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
        if (error.status == 401 || error.status == 403) {
          window.location.href = "/login?tab=admin";
        }
      }
    } finally {
      dispatch(setLoaded(true));
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get(
        `${laravelUrl}/api/admin/groups`,
        requestHeader()
      );
      console.log(res.data);

      dispatch(setDataGroup(res.data));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
    }
  };

  const submitSetting = async (settingFormData: SettingFormData) => {
    dispatch(setSettingIsLoading(true));
    try {
      const res = await axios.post(
        `${laravelUrl}/api/admin/settings`,
        {
          botDelayEnabled: settingFormData.botDelayEnabled ? true : false,
          botDelay: settingFormData.botDelay,
        },
        requestHeader()
      );

      const data: ChangeAdminSettingsResponse = res.data;
      if (data.success) {
        toast("Data berhasil di sinkron!");
        return;
      }

      dispatch(setData(res.data));
    } catch (error) {
      if (error instanceof AxiosError) {
        toast(error.message);
        console.log(error.message);
      }
      console.log(error);
    } finally {
      dispatch(setSettingIsLoading(false));
      fetchData();
    }
  };

  const deleteBroadcastImages = async () => {
    dispatch(setDeleteLoading(true));
    try {
      const res = await axios.delete(
        `${laravelUrl}/api/admin/broadcast/pfp-slide`,
        requestHeader()
      );
      const data: DeleteAdminBroadcastPfpSlide = res.data;
      if (!data.success) {
        toast("Failed to delete");
        return;
      }

      toast("Data berhasil dihapus!");
      fetchData();
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
    } finally {
      dispatch(setDeleteLoading(false));
    }
  };

  const handleSubmitSetting = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: SettingFormData = Object.fromEntries(formData);
    submitSetting(data);
  };

  const handleSubmitBroadcast = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: BroadcastFormData = Object.fromEntries(formData);
    submitBroadcastChange(data);
  };

  const submitBroadcastChange = async (
    broadcastFormData: BroadcastFormData
  ) => {
    dispatch(setBroadcastIsLoading(true));
    try {
      const formDataObject = new FormData();

      formDataObject.append(
        "pfpslideEnabled",
        broadcastFormData.pfpslideEnabled ? "1" : "0"
      );

      if (broadcastFormData.pfpSlideInterval) {
        formDataObject.append(
          "pfpSlideInterval",
          broadcastFormData.pfpSlideInterval
        );
      }

      if (state.files && state.files?.length > 0) {
        for (let i = 0; i < state.files.length; i++) {
          formDataObject.append("pfpSlide[]", state.files[i]);
        }
      }

      const res = await axios.post(
        `${laravelUrl}/api/admin/broadcast`,
        formDataObject,
        {
          ...requestHeader(true),
          onUploadProgress: (data) => {
            dispatch(
              setUploadProgress(
                Math.round((100 * data.loaded) / (data.total || 0))
              )
            );
          },
        }
      );

      const data: ChangeAdminBroadcastResponse = res.data;
      if (data.success) {
        if (expressUrl) {
          await axios.get(expressUrl);
        }
        toast("Data berhasil di sinkron!");
        return;
      }

      dispatch(setData(res.data));
    } catch (error) {
      if (error instanceof AxiosError) {
        toast(error.message);
        console.log(error.message);
      }
      console.log(error);
    } finally {
      dispatch(setBroadcastIsLoading(false));
      fetchData();
      if (state.files) {
        dispatch(setFiles([]));
      }
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonContent = e.target?.result as string;
          const data: Datum[] = JSON.parse(jsonContent);
          const convertDates = (data: Datum[]) => {
            return data.map((item) => {
              const createdAt = new Date(item.created_at)
                .toISOString()
                .slice(0, 19)
                .replace("T", " ");
              const updatedAt = new Date(item.updated_at)
                .toISOString()
                .slice(0, 19)
                .replace("T", " ");

              return {
                ...item,
                created_at: createdAt,
                updated_at: updatedAt,
              };
            });
          };

          const convertedData = convertDates(data);

          dispatch(setLoaded(false));
          await axios.post(
            `${laravelUrl}/api/responses/import`,
            {
              data: convertedData,
            },
            requestHeader()
          );

          toast("Data berhasil diimpor");
        } catch (error) {
          console.log(error);
          if (axios.isAxiosError(error)) {
            console.log(error.message);
            toast(error.message);
          }
        } finally {
          dispatch(setLoaded(true));
        }
      };
      reader.readAsText(file);
    }
  };

  const importData = () => {
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    fileInput.click();
  };

  const exportData = () => {
    const exportData = state.dataGroup?.groups;
    const jsonStr = JSON.stringify(exportData);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data-respons-bot";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchData();
    fetchGroups();
  }, []);

  useEffect(() => {
    dispatch(
      setBotDelayEnabled(
        state.data?.group?.admin_settings.bot_delay_enabled || false
      )
    );
    dispatch(
      setPfpSlideshowEnabled(
        state.data?.group?.admin_broadcaster.pfpslide_enabled || false
      )
    );
    dispatch(
      setFilesInDb(
        state.data?.group?.admin_broadcaster.pfpslide
          ? JSON.parse(state.data?.group?.admin_broadcaster.pfpslide)
          : []
      )
    );
  }, [state.data]);

  const dropZoneConfig = {
    maxFiles: 10000,
    maxSize: 1024 * 1024 * 4,
    multiple: true,
  };

  return (
    <AuthenticatedLayout>
      {state.loaded ? (
        <div className="flex flex-col space-y-6 p-6">
          <div className="flex flex-col space-y-1">
            <h2 className="text-3xl font-semibold">Dashboard Admin</h2>
            <p className="pl-1 text-sm text-muted-foreground">
              No Telepon Anda: {state.data?.group?.admin_user_id || ""}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="row-span-2">
              <Card className="w-full h-full">
                <CardHeader>
                  <CardTitle className="text-2xl">Daftar Group</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-y-2 flex-col">
                    {state.dataGroup?.groups.map((item, index) => {
                      return (
                        <UserProfile
                          isGroup
                          pushname={item.group_name}
                          phoneNumber={item.group_user_id}
                          pfpUrl={item.group_pfp}
                          key={index}
                        />
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={exportData} variant="outline">
                    Ekspor Data
                  </Button>
                </CardFooter>
              </Card>
            </div>
            <div>
              <Card className="w-full h-full">
                <CardHeader>
                  <CardTitle className="text-2xl">Setelan</CardTitle>
                </CardHeader>
                <CardContent>
                  <form ref={settingForm} onSubmit={handleSubmitSetting}>
                    <div className="flex space-y-4 flex-col">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={state.botDelayEnabled}
                          onCheckedChange={(e) =>
                            dispatch(setBotDelayEnabled(e))
                          }
                          id="botDelayEnabled"
                          name="botDelayEnabled"
                        />
                        <Label htmlFor="botDelayEnabled">
                          Nyalakan delay perintah bot.
                        </Label>
                      </div>
                      {state.botDelayEnabled && (
                        <div className="flex items-center">
                          <Select
                            defaultValue={
                              state.data?.group?.admin_settings.bot_delay.toString() ||
                              ""
                            }
                            name="botDelay"
                          >
                            <SelectTrigger className="w-[280px]">
                              <SelectValue placeholder="Pilih interval delay" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Delay Per User</SelectLabel>
                                <SelectItem value="3">3 detik</SelectItem>
                                <SelectItem value="6">6 detik</SelectItem>
                                <SelectItem value="10">10 detik</SelectItem>
                                <SelectItem value="15">15 detik</SelectItem>
                                <SelectItem value="24">24 detik</SelectItem>
                                <SelectItem value="30">30 detik</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                    <div className="flex w-full h-full space-x-3">
                      {state.settingIsLoading ? (
                        <Button disabled>
                          <LoadingSpinner />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => settingForm.current?.requestSubmit()}
                        >
                          Simpan Perubahan
                        </Button>
                      )}
                    </div>
                    <div className="flex w-full h-full space-x-3">
                      <Button onClick={importData} variant="outline">
                        Impor Data Perintah
                      </Button>
                      <input
                        id="fileInput"
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
            <div className="w-[300px] md:w-full">
              <Card className="w-full h-full">
                <CardHeader>
                  <CardTitle className="text-2xl">Broadcaster</CardTitle>
                </CardHeader>
                <CardContent>
                  <form ref={broadcastForm} onSubmit={handleSubmitBroadcast}>
                    <div className="flex space-y-3 flex-col">
                      <div className="flex items-center space-x-2">
                        <Switch
                          onCheckedChange={(e) =>
                            dispatch(setPfpSlideshowEnabled(e))
                          }
                          checked={state.pfpSlideshowEnabled}
                          id="pfpSlideshow"
                          name="pfpslideEnabled"
                        />
                        <Label htmlFor="pfpSlideshow">
                          Profile Picture Slideshow.
                        </Label>
                      </div>
                      {state.pfpSlideshowEnabled && (
                        <div className="flex flex-col space-y-4">
                          <Select
                            defaultValue={
                              state.data?.group?.admin_broadcaster.pfpslide_interval?.toString() ||
                              ""
                            }
                            name="pfpSlideInterval"
                          >
                            <SelectTrigger className="w-[260px] md:w-[280px]">
                              <SelectValue placeholder="Pilih interval slideshow" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Menit</SelectLabel>
                                <SelectItem value="900">
                                  Setiap 15 menit.
                                </SelectItem>
                                <SelectItem value="1800">
                                  Setiap 30 menit.
                                </SelectItem>
                                <SelectItem value="2700">
                                  Setiap 45 menit.
                                </SelectItem>
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Jam</SelectLabel>
                                <SelectItem value="3600">
                                  Setiap 1 jam
                                </SelectItem>
                                <SelectItem value="7200">
                                  Setiap 2 jam
                                </SelectItem>
                                <SelectItem value="10800">
                                  Setiap 3 jam
                                </SelectItem>
                                <SelectItem value="21600">
                                  Setiap 6 jam
                                </SelectItem>
                                <SelectItem value="43200">
                                  Setiap 12 jam
                                </SelectItem>
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Harian</SelectLabel>
                                <SelectItem value="86400">
                                  Setiap hari (24 jam sejak waktu ini)
                                </SelectItem>
                                <SelectItem value="0">
                                  Setiap hari (Setiap 00:00 malam)
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          {state.filesInDb && state.filesInDb.length > 0 && (
                            <div className="flex flex-col bg-gray-100 p-3 rounded-xl space-y-2">
                              {state.filesInDb.map((file, i) => (
                                <div className="flex justify-between" key={i}>
                                  <div className="flex items-center space-x-2">
                                    <ImageIcon className="h-4 w-4 stroke-current" />
                                    <Link
                                      target="_blank"
                                      href={`${laravelUrl}/storage/${file}`}
                                      className="text-sm text-blue-500 hover:underline line-clamp-1 w-[200px] md:w-full"
                                    >
                                      {
                                        file.split("/")[
                                          file.split("/").length - 1
                                        ]
                                      }
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {state.filesInDb && state.filesInDb.length > 0 && (
                            <>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    className="w-fit"
                                    variant="destructive"
                                  >
                                    <Trash2 />
                                    Hapus Gambar di Database
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-xl lg:mx-auto lg:w-auto">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Apakah anda yakin?
                                    </DialogTitle>
                                    <DialogDescription className="py-4">
                                      Permintaan ini tidak bisa di kembalikan
                                      (alias di undo), data anda akan selamanya
                                      dihapus. Apakah anda yakin?
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <div className="flex space-x-3">
                                      <>
                                        {state.deleteLoading ? (
                                          <Button
                                            variant="destructive"
                                            disabled
                                          >
                                            <LoadingSpinner />
                                          </Button>
                                        ) : (
                                          <Button
                                            onClick={deleteBroadcastImages}
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
                                  &nbsp; atau drag and drop (max file 16)
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
                        </div>
                      )}
                      {state.files &&
                        state.files.length > 0 &&
                        state.filesInDb &&
                        state.filesInDb.length > 0 && (
                          <p className="text-red-500">
                            PERINGTAN: MENGUPLOAD GAMBAR AKAN MENGHAPUS GAMBAR
                            LAMA YANG DI DATABASE
                          </p>
                        )}
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  {state.broadcastIsLoading ? (
                    <div className="flex flex-col space-y-4">
                      <Progress
                        className="w-full"
                        value={state.uploadProgress}
                      />
                      <Button variant="outline" disabled>
                        <LoadingSpinner />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => broadcastForm.current?.requestSubmit()}
                      variant="outline"
                    >
                      Simpan Perubahan
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner isForPage />
        </div>
      )}
    </AuthenticatedLayout>
  );
}
