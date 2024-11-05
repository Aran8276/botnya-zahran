"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const customResponses = [
    { id: "abc123", case: "!hello", reply: "Hello World!" },
    { id: "cba123", case: "!etc", reply: "etc!" },
    {
      id: "ccc323",
      case: "!etc",
      reply:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Debitis, harum doloremque! Exercitationem, magni ipsam iste et dignissimos quae quo inventore ipsa modi enim dolorum harum repellat quam, quasi unde ut?",
    },
  ];
  return (
    <div className="space-y-8 max-w-3xl mx-auto py-10">
      <div className="flex justify-center text-center">
        <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Daftar Perintah WhatsApp Bot
        </h2>
      </div>
      <Table>
        <TableCaption className="py-6">
          <Link href="/tambah">
            <Button>Tambah Perintah</Button>
          </Link>
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">No</TableHead>
            <TableHead>Perintah</TableHead>
            <TableHead className="text-center">Pesan</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customResponses.map((item, index) => {
            return (
              <TableRow key={index}>
                <TableCell key={index + 1} className="font-medium">
                  {index + 1}.
                </TableCell>
                <TableCell key={item.case}> {item.case}</TableCell>
                <TableCell key={item.reply} className="text-center">
                  <span className="line-clamp-1">{item.reply}</span>
                </TableCell>
                <TableCell className="flex space-x-3">
                  <Link href={`/edit/${item.id}`}>
                    <Button variant="secondary">Edit</Button>
                  </Link>
                  <Button variant="destructive">Hapus</Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
