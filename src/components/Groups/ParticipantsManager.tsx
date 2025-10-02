// src/components/Groups/ParticipantsManager.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GroupParticipantSchema } from "@/lib/schemas";
import { createParticipant, deleteParticipant } from "@/lib/actions";
import { GroupParticipants } from "@prisma/client";
import { useTransition } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { IconTrash } from "@tabler/icons-react";

interface ParticipantsManagerProps {
  participants: GroupParticipants[];
  groupId: string;
}

export default function ParticipantsManager({
  participants,
  groupId,
}: ParticipantsManagerProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof GroupParticipantSchema>>({
    resolver: zodResolver(GroupParticipantSchema),
  });

  const onSubmit = (data: z.infer<typeof GroupParticipantSchema>) => {
    startTransition(() => {
      toast.promise(createParticipant(groupId, data), {
        loading: "Adding participant...",
        success: () => {
          reset();
          return "Participant added.";
        },
        error: "Failed to add participant.",
      });
    });
  };

  const handleDelete = (id: string) => {
    startTransition(() => {
      toast.promise(deleteParticipant(id, groupId), {
        loading: "Removing participant...",
        success: "Participant removed.",
        error: "Failed to remove participant.",
      });
    });
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-start gap-4"
      >
        <div className="grid flex-1 gap-2">
          <Input {...register("serializedId")} placeholder="Serialized ID" />
          {errors.serializedId && (
            <p className="text-sm text-red-500">
              {errors.serializedId.message}
            </p>
          )}
        </div>
        <div className="grid flex-1 gap-2">
          <Input {...register("pushName")} placeholder="Push Name" />
          {errors.pushName && (
            <p className="text-sm text-red-500">{errors.pushName.message}</p>
          )}
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding..." : "Add"}
        </Button>
      </form>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serialized ID</TableHead>
              <TableHead>Push Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.serializedId}</TableCell>
                <TableCell>{p.pushName}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(p.id)}
                  >
                    <IconTrash className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {participants.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No participants.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
