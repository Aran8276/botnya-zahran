"use client";

import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimePicker12Demo } from "@/components/ui/time-picker12";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   FileInput,
//   FileUploader,
//   FileUploaderContent,
//   FileUploaderItem,
// } from "@/components/ui/extension/file-upload";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { CloudUpload, ImageIcon, Paperclip, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
  setData,
  // setDeleteLoading,
  setFiles,
  setFilesInDb,
  setLoaded,
  setLockMentionEveryone,
  setMotd,
  setMotdEnabled,
  setMotdSchedule,
  setPfpSlideshowEnabled,
  setSaveLoading,
  setSchedulePiket,
} from "@/lib/features/Group/groupSlice";
import { FormEvent, useEffect, useRef } from "react";
import {
  expressUrl,
  laravelUrl,
  requestHeader,
} from "@/components/GlobalValues";
import axios, { AxiosError } from "axios";
import UserProfile from "@/components/elements/UserProfile";
import {
  ChangeGroupSettingsResponse,
  // DeleteBroadcastImagesResponse,
  GroupPermissionCheckResponse,
} from "@/components/types/type";
import { toast } from "sonner";
import LoadingSpinner from "@/components/spinner";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
// import Link from "next/link";

interface BroadcastFormData {
  motdEnabled?: boolean;
  motd?: string;
  pfpslideEnabled?: boolean;
  pfpSlideInterval?: string;
}

export default function Page() {
  const broadcasterForm = useRef<HTMLFormElement | null>(null);
  const state = useSelector((state: RootState) => state.group);
  const dispatch = useDispatch();

  // const dropZoneConfig = {
  //   maxFiles: 16,
  //   maxSize: 1024 * 1024 * 4,
  //   multiple: true,
  // };

  const fetchData = async (groupid: string) => {
    dispatch(setLoaded(false));
    try {
      const res = await axios.get(
        `${laravelUrl}/api/group/${groupid}`,
        requestHeader()
      );
      console.log(res.data);

      dispatch(setData(res.data));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
    } finally {
      dispatch(setLoaded(true));
    }
  };

  const handleSettingChange = async () => {
    try {
      const res = await axios.post(
        `${laravelUrl}/api/group/settings/${state.data?.group.group_user_id}`,
        {
          schedulePiket: state.schedulePiket,
          lockMentionEveryone: state.lockMentionEveryone,
        },
        requestHeader()
      );

      const data: ChangeGroupSettingsResponse = res.data;
      if (data.success) {
        await axios.get(`${expressUrl}/group`);
        toast("Data berhasil di sinkron!");
        return;
      }

      dispatch(setData(res.data));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
    }
  };

  const submitBroadcastChange = async (
    broadcastFormData: BroadcastFormData
  ) => {
    dispatch(setSaveLoading(true));
    try {
      const formDataObject = new FormData();

      formDataObject.append(
        "motdEnabled",
        broadcastFormData.motdEnabled ? "1" : "0"
      );

      formDataObject.append("pfpslideEnabled", "0");

      if (broadcastFormData.motd) {
        formDataObject.append("motd", broadcastFormData.motd);
      }

      if (state.motdSchedule) {
        console.log(broadcastFormData);
        formDataObject.append("motdTime", state.motdSchedule.toISOString());
      }

      // if (broadcastFormData.pfpSlideInterval) {
      //   formDataObject.append(
      //     "pfpSlideInterval",
      //     broadcastFormData.pfpSlideInterval
      //   );
      // }

      // if (state.files && state.files?.length > 0) {
      //   for (let i = 0; i < state.files.length; i++) {
      //     formDataObject.append("pfpSlide[]", state.files[i]);
      //   }
      // }

      const res = await axios.post(
        `${laravelUrl}/api/group/broadcast/${state.data?.group.group_user_id}`,
        formDataObject,
        requestHeader(true)
      );

      const data: ChangeGroupSettingsResponse = res.data;
      if (data.success) {
        if (expressUrl) {
          await axios.get(`${expressUrl}/group`);
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
      dispatch(setSaveLoading(false));
      fetchPermissions();
      if (state.files) {
        dispatch(setFiles([]));
      }
    }
  };

  const submitBroadcastForm = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: BroadcastFormData = Object.fromEntries(formData);
    console.log(data);

    submitBroadcastChange(data);
  };

  // const deleteBroadcastImages = async () => {
  //   dispatch(setDeleteLoading(true));
  //   try {
  //     const res = await axios.delete(
  //       `${laravelUrl}/api/group/broadcast/pfp-slide/${state.data?.group.group_user_id}`,
  //       requestHeader()
  //     );
  //     const data: DeleteBroadcastImagesResponse = res.data;
  //     if (!data.success) {
  //       toast("Failed to delete");
  //       return;
  //     }

  //     toast("Data berhasil dihapus!");
  //     fetchPermissions();
  //   } catch (error) {
  //     if (error instanceof AxiosError) {
  //       console.log(error.message);
  //     }
  //   } finally {
  //     dispatch(setDeleteLoading(false));
  //   }
  // };

  const deleteGroup = async () => {
    try {
      await axios.delete(
        `${laravelUrl}/api/group/${state.data?.group.group_user_id}`,
        requestHeader()
      );

      window.location.replace("/login");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast(error.message);
        console.log(error.message);
      }
      console.log(error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await axios.get(
        `${laravelUrl}/api/group/check-permissions`,
        requestHeader()
      );

      const data: GroupPermissionCheckResponse = res.data;
      if (data.groupid) {
        fetchData(data.groupid);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
        if (error.status == 401 || error.status == 403) {
          window.location.href = "/login?tab=group";
        }
      }
    }
  };

  const exportData = () => {
    const exportData = state.data?.group.participants;
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
    fetchPermissions();
  }, []);

  useEffect(() => {
    dispatch(
      setLockMentionEveryone(
        state.data?.group.group_settings.lock_mention_everyone
      )
    );
    dispatch(setSchedulePiket(state.data?.group.group_settings.schedule_piket));

    dispatch(setMotdEnabled(state.data?.group.broadcaster.motd_enabled));
    dispatch(
      setPfpSlideshowEnabled(state.data?.group.broadcaster.pfpslide_enabled)
    );
    dispatch(
      setMotdSchedule(
        new Date(state.data?.group.broadcaster.motd_time || Date.now())
      )
    );
    if (state.data?.group.broadcaster.pfp_slide) {
      dispatch(
        setFilesInDb(JSON.parse(state.data?.group.broadcaster.pfp_slide))
      );
    }
    dispatch(setMotd(state.data?.group.broadcaster.motd));
  }, [state.data]);

  useEffect(() => {
    handleSettingChange();
  }, [state.schedulePiket, state.lockMentionEveryone]);

  return (
    <AuthenticatedLayout>
      {state.loaded ? (
        <div className="flex flex-col space-y-6 p-6">
          <div className="flex flex-col space-y-1">
            <h2 className="text-3xl font-semibold">
              {state.data?.group.group_name}
            </h2>
            <p className="pl-1 text-sm text-muted-foreground">
              Group ID: {state.data?.group.group_user_id}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="row-span-2">
              <Card className="w-full h-full">
                <CardHeader>
                  <CardTitle className="text-2xl">Anggota Group</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-y-2 flex-col">
                    {state.data?.group.participants &&
                      state.data?.group.participants.length < 1 && (
                        <>
                          <p className="text-yellow-500 font-bold">
                            Peringatan: Daftar anggota group kosong.
                          </p>
                          <p>
                            Kemungkinan ada masalah untuk mendapatkan daftar
                            group melalui.
                          </p>
                          <p>Jalankan </p>
                          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                            !reregister
                          </code>{" "}
                          <span>
                            di WhatsApp pada group ini, untuk mencoba registrasi
                            ulang anggota group.
                          </span>
                        </>
                      )}
                    {state.data?.group.participants.map((item, index) => {
                      return (
                        <UserProfile
                          pfpUrl={item.image}
                          pushname={item.pushname}
                          isMe={item.isMe}
                          phoneNumber={item.id.user}
                          key={index}
                        />
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter>
                  {state.data?.group.participants &&
                    state.data?.group.participants.length > 0 && (
                      <Button variant="outline" onClick={exportData}>
                        Ekspor Data
                      </Button>
                    )}
                </CardFooter>
              </Card>
            </div>
            <div className="w-[300px] md:w-full">
              <Card className="w-full h-full">
                <CardHeader>
                  <CardTitle className="text-2xl">Setelan Group</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-y-3 flex-col">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={state.lockMentionEveryone}
                        onCheckedChange={(e) =>
                          dispatch(setLockMentionEveryone(e))
                        }
                        id="everyoneAdminOnly"
                      />
                      <Label htmlFor="everyoneAdminOnly">
                        Kunci {"  "}
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                          !everyone
                        </code>{" "}
                        {"  "}
                        hanya untuk admin.
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={state.schedulePiket}
                        onCheckedChange={(e) => dispatch(setSchedulePiket(e))}
                        id="automaticPiket"
                      />
                      <Label htmlFor="automaticPiket">
                        Jadwal otomatis {"  "}
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                          !piket
                        </code>{" "}
                        {"  "}
                        setiap minggu.
                      </Label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex flex-col md:flex-row w-full h-full space-y-3 md:space-y-0 md:space-x-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline">Ganti Password</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Ubah password group
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            <span>
                              Untuk mengubah password group login, anda dapat
                              mengirim{" "}
                            </span>
                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                              !lupapassword
                            </code>{" "}
                            <span>
                              ke bot pada group ini di WhatsApp. Admin akan
                              dikirimkan perintah untuk mengubah password di
                              sana.
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogAction>OK</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Hapus Registrasi</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove your data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <div className="flex space-x-3">
                            <AlertDialogCancel asChild>
                              <Button variant="outline">Tutup</Button>
                            </AlertDialogCancel>
                            <Button onClick={deleteGroup} variant="destructive">
                              Hapus
                            </Button>
                          </div>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardFooter>
              </Card>
            </div>
            <div>
              <Card className="w-full h-full">
                <CardHeader>
                  <CardTitle className="text-2xl">Broadcaster</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitBroadcastForm} ref={broadcasterForm}>
                    <div className="flex space-y-3 flex-col">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={state.motdEnabled}
                          onCheckedChange={(e) => dispatch(setMotdEnabled(e))}
                          id="motd"
                          name="motdEnabled"
                        />
                        <Label htmlFor="motd">Message of the Day.</Label>
                      </div>
                      {state.motdEnabled && (
                        <div className="flex flex-col space-y-4">
                          <TimePicker12Demo
                            setDate={(e) => dispatch(setMotdSchedule(e))}
                            date={state.motdSchedule}
                          />

                          <Textarea
                            name="motd"
                            defaultValue={
                              state.data?.group.broadcaster.motd || ""
                            }
                            placeholder="Ketik pesan apa yang dikatakan..."
                          />
                        </div>
                      )}
                      {/* <div className="flex items-center space-x-2">
                        <Switch
                          checked={state.pfpSlideshowEnabled}
                          onCheckedChange={(e) =>
                            dispatch(setPfpSlideshowEnabled(e))
                          }
                          id="pfpSlideshow"
                          name="pfpslideEnabled"
                        />
                        <Label htmlFor="pfpSlideshow">
                          Profile Picture Slideshow.
                        </Label>
                      </div> */}
                      {/* {state.pfpSlideshowEnabled && (
                        <div className="flex flex-col space-y-4">
                          <Select
                            defaultValue={(
                              state.data?.group.broadcaster
                                .pfp_slide_interval ?? ""
                            ).toString()}
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
                        )} */}
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  {state.saveLoading ? (
                    <Button disabled variant="outline">
                      <LoadingSpinner />
                    </Button>
                  ) : (
                    <Button
                      onClick={
                        /* submitBroadcastChange */
                        () => broadcasterForm.current?.requestSubmit()
                      }
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
