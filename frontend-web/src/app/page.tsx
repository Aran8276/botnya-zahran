"use client";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import axios, { AxiosError } from "axios";
import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  laravelAccessToken,
  // laravelAccessToken,
  laravelUrl,
  requestHeader,
} from "@/components/GlobalValues";
import { toast } from "sonner";
import LoadingSpinner from "@/components/spinner";
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
import { Plus, Search, Trash2 } from "lucide-react";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
  setData,
  setDeleteLoading,
  setLoaded,
  setOpen,
  setSearchData,
} from "@/lib/features/Manage/manageSlice";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface LogoutResponse {
  success: boolean;
  status: number;
  msg: string;
}

export interface DeleteResponse {
  success: boolean;
  msg: string;
  id: string;
  status: number;
}

export default function Home() {
  const state = useSelector((state: RootState) => state.manage);
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const page = params.get("page");
  const searchQuery = params.get("q");
  const router = useRouter();
  const pathname = usePathname();

  const deleteData = async (id: string) => {
    dispatch(setDeleteLoading(true));
    try {
      const res = await axios.delete(
        `${laravelUrl}/api/responses/response/${id}`,
        requestHeader()
      );
      const data: DeleteResponse = res.data;
      if (!data.success) {
        toast("Failed to delete");
        return;
      }

      toast("Data berhasil dihapus!");
      fetchData();
      fetchSearch();
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
    } finally {
      dispatch(setDeleteLoading(false));
      dispatch(setOpen(false));
    }
  };

  const fetchData = async (setPage?: number) => {
    setLoaded(false);
    try {
      const res = await axios.get(
        `${laravelUrl}/api/responses/index${
          setPage ? `?page=${setPage}` : page ? `?page=${page}` : ""
        }`,
        requestHeader()
      );
      console.log(res.data);
      dispatch(setData(res.data));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
        if (error.status == 401 || error.status == 403) {
          window.location.href = "/login";
        }
      }
    } finally {
      dispatch(setLoaded(true));
    }
  };

  const exportData = () => {
    const exportData = state.searchData?.responses;
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

  const handleNextPage = () => {
    if (state.data?.responses) {
      const newPage = state.data.responses.current_page + 1;
      router.push(
        `${pathname}?page=${newPage}${searchQuery ? `&q=${searchQuery}` : ""}`
      );
      fetchData(newPage);
    }
  };

  const handlePrevPage = () => {
    if (state.data?.responses && !(state.data.responses.current_page == 1)) {
      const newPage = state.data.responses.current_page - 1;
      router.push(
        `${pathname}?page=${newPage}${searchQuery ? `&q=${searchQuery}` : ""}`
      );
      fetchData(newPage);
    }
  };

  const setPage = (pageToSet: number) => {
    router.push(`${pathname}?page=${pageToSet}`);
    fetchData(pageToSet);
  };

  const generatePaginationLinks = () => {
    if (state.data) {
      const paginationLinks = [];
      const startPage = Math.max(1, state.data.responses.current_page - 3);
      const endPage = Math.min(
        state.data.responses.last_page,
        state.data.responses.current_page + 3
      );

      for (let i = startPage; i <= endPage; i++) {
        paginationLinks.push(
          <React.Fragment key={i}>
            <PaginationItem className="hidden md:block cursor-pointer">
              <PaginationLink
                isActive={i === state.data.responses.current_page}
                onClick={() => setPage(i)}
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          </React.Fragment>
        );
      }

      return paginationLinks;
    }
  };

  const fetchSearch = async () => {
    try {
      const searchRes = await axios.get(
        `${laravelUrl}/api/responses/search?`,
        requestHeader()
      );
      // console.log(searchRes.data);
      dispatch(setSearchData(searchRes.data));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      }
    }
  };

  useEffect(() => {
    if (laravelAccessToken) {
      fetchData();
      fetchSearch();
      return;
    }
    window.location.href = "/login";
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        dispatch(setOpen((open: boolean) => !open));
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  return (
    <>
      <AuthenticatedLayout>
        {state.loaded ? (
          <div className="space-y-8 w-full p-6">
            <div className="pr-8">
              <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row items-center justify-between w-full">
                <h2 className="flex justify-start scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  Semua Perintah
                </h2>
                <div className="flex items-center space-y-3 md:space-y-0 space-x-0 flex-col md:flex-row md:space-x-3">
                  <Link className="w-full lg:w-auto" href="/tambah">
                    <Button>
                      <Plus />
                      Tambah Perintah
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => dispatch(setOpen(true))}
                    size="icon"
                  >
                    <Search />
                  </Button>
                  <Button variant="outline" onClick={exportData}>
                    Ekspor
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-12">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden md:table-cell w-[100px]">
                      No
                    </TableHead>
                    <TableHead className="hidden md:table-cell w-[100px]">
                      Perintah
                    </TableHead>
                    <TableHead className="hidden md:table-cell w-[100px]">
                      Pesan
                    </TableHead>
                    <TableHead className="hidden md:table-cell w-[100px]">
                      Gambar
                    </TableHead>
                    <TableHead className="hidden md:table-cell text-center w-[100px]">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.data?.responses.data.map((item, index) => {
                    return (
                      <TableRow key={`row-${index}`}>
                        <TableCell
                          key={`cell-index-${index}`}
                          className="font-medium"
                        >
                          {index + 1}.
                        </TableCell>
                        <TableCell key={`cell-case-${item.case}`}>
                          <span className="hidden md:block">{item.case}</span>
                          <div className="flex md:hidden flex-col space-y-2">
                            <p>{item.case}</p>
                            <p className="line-clamp-1 w-[30px]">
                              {item.reply}
                            </p>
                            <p className="line-clamp-1">
                              {item.images
                                ? `(${
                                    item.images &&
                                    JSON.parse(item.images).length
                                  } gambar)`
                                : "Tidak ada gambar."}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell
                          className="hidden lg:table-cell"
                          key={`cell-reply-${item.reply}`}
                        >
                          <div className="w-[200px]">
                            <span className="line-clamp-1">{item.reply}</span>
                          </div>
                        </TableCell>
                        <TableCell
                          className="hidden lg:table-cell"
                          key={`cell-images-${item.reply}`}
                        >
                          <div className="w-[200px]">
                            <span className="line-clamp-1">
                              {item.images
                                ? `(${
                                    item.images &&
                                    JSON.parse(item.images).length
                                  } gambar)`
                                : "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center w-full flex justify-center space-x-3">
                          <Link href={`/edit/${item.id}`}>
                            <Button variant="secondary">Edit</Button>
                          </Link>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="destructive">Hapus</Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-xl lg:mx-auto lg:w-auto">
                              <DialogHeader>
                                <DialogTitle>Apakah anda yakin?</DialogTitle>
                                <DialogDescription className="py-4">
                                  Permintaan ini tidak bisa di kembalikan (alias
                                  di undo), data anda akan selamanya dihapus.
                                  Apakah anda yakin?
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <div className="flex space-x-3">
                                  <>
                                    {state.deleteLoading ? (
                                      <Button variant="destructive" disabled>
                                        <LoadingSpinner />
                                      </Button>
                                    ) : (
                                      <Button
                                        onClick={() => deleteData(item.id)}
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
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="w-fit flex justify-center">
                {(state.data?.responses.next_page_url ||
                  state.data?.responses.prev_page_url) && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem className="cursor-pointer">
                        {state.data.responses.prev_page_url && (
                          <PaginationPrevious onClick={handlePrevPage} />
                        )}
                      </PaginationItem>
                      {generatePaginationLinks()}
                      <PaginationItem className="cursor-pointer hidden md:block">
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem className="md:hidden">
                        <Button variant="outline">
                          {state.data.responses.current_page}
                        </Button>
                      </PaginationItem>
                      <PaginationItem className="cursor-pointer">
                        {state.data.responses.next_page_url && (
                          <PaginationNext onClick={handleNextPage} />
                        )}
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </div>

            <Command>
              <CommandDialog
                open={state.open}
                onOpenChange={(e) => dispatch(setOpen(e))}
              >
                <CommandInput
                  name="search"
                  placeholder="Ketik perintah disini..."
                />
                <CommandList className="px-4 md:px-0">
                  <CommandEmpty>Gak ada bang.</CommandEmpty>
                  {state.searchData?.responses.map((item, index) => {
                    return (
                      <CommandItem key={index}>
                        <div className="flex w-full justify-between p-2">
                          <div>{item.case}</div>
                          <div className="flex space-x-5 scale-[0.90]">
                            <Link href={`/edit/${item.id}`}>
                              <Button variant="secondary">Edit</Button>
                            </Link>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive">Hapus</Button>
                              </DialogTrigger>
                              <DialogContent className="rounded-xl lg:mx-auto lg:w-auto">
                                <DialogHeader>
                                  <DialogTitle>Apakah anda yakin?</DialogTitle>
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
                                        <Button variant="destructive" disabled>
                                          <LoadingSpinner />
                                        </Button>
                                      ) : (
                                        <Button
                                          onClick={() => deleteData(item.id)}
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
                          </div>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandList>
              </CommandDialog>
            </Command>
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
