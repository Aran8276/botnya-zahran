"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GroupParticipantSchema } from "@/lib/schemas";
import {
  createParticipant,
  deleteParticipant,
  toggleGroupAdmin,
} from "@/lib/actions";
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
import { IconShield, IconTrash } from "@tabler/icons-react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface ParticipantsManagerProps {
  participants: GroupParticipants[];
  groupId: string;
  adminSerializedIds: string[];
  isGroupAdmin: boolean;
}

export default function ParticipantsManager({
  participants,
  groupId,
  adminSerializedIds,
  isGroupAdmin,
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

  const handleToggleAdmin = (participantSerializedId: string) => {
    startTransition(() => {
      toast.promise(toggleGroupAdmin(groupId, participantSerializedId), {
        loading: "Updating admin status...",
        success: "Admin status updated.",
        error: "Failed to update admin status.",
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
          <Input
            {...register("serializedId")}
            placeholder="Serialized ID"
            disabled={!isGroupAdmin}
          />
          {errors.serializedId && (
            <p className="text-sm text-red-500">
              {errors.serializedId.message}
            </p>
          )}
        </div>
        <div className="grid flex-1 gap-2">
          <Input
            {...register("pushName")}
            placeholder="Push Name"
            disabled={!isGroupAdmin}
          />
          {errors.pushName && (
            <p className="text-sm text-red-500">{errors.pushName.message}</p>
          )}
        </div>
        <Button type="submit" disabled={isPending || !isGroupAdmin}>
          {isPending ? "Adding..." : "Add"}
        </Button>
      </form>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serialized ID</TableHead>
              <TableHead>Push Name</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.serializedId}</TableCell>
                <TableCell>{p.pushName}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`admin-toggle-${p.id}`}
                      checked={adminSerializedIds.includes(p.serializedId)}
                      onCheckedChange={() => handleToggleAdmin(p.serializedId)}
                      disabled={!isGroupAdmin}
                    />
                    <Label htmlFor={`admin-toggle-${p.id}`}>
                      <IconShield className="h-4 w-4" />
                    </Label>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(p.id)}
                    disabled={!isGroupAdmin}
                  >
                    <IconTrash className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {participants.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
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
