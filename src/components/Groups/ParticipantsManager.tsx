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
import { GroupParticipants, Role } from "@prisma/client";
import { useTransition, useState } from "react";
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
import { IconShield } from "@tabler/icons-react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useSession } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

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
  const { data: session } = useSession();
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);
  const [participantToToggle, setParticipantToToggle] = useState<string | null>(
    null
  );

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

  const executeToggleAdmin = (participantSerializedId: string) => {
    startTransition(() => {
      toast.promise(toggleGroupAdmin(groupId, participantSerializedId), {
        loading: "Updating admin status...",
        success: "Admin status updated.",
        error: "Failed to update admin status.",
      });
    });
  };

  const handleToggleAdmin = (participantSerializedId: string) => {
    const isSystemAdmin = session?.user.role === Role.ADMIN;
    const isParticipantAdmin = adminSerializedIds.includes(
      participantSerializedId
    );

    if (!isParticipantAdmin && !isSystemAdmin) {
      setParticipantToToggle(participantSerializedId);
      setShowAdminConfirm(true);
    } else {
      executeToggleAdmin(participantSerializedId);
    }
  };

  const onConfirmAdminToggle = () => {
    if (participantToToggle) {
      executeToggleAdmin(participantToToggle);
    }
    setShowAdminConfirm(false);
    setParticipantToToggle(null);
  };

  return (
    <>
      <AlertDialog open={showAdminConfirm} onOpenChange={setShowAdminConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Admin Promotion</AlertDialogTitle>
            <AlertDialogDescription>
              Making a user a group admin is an irreversible action for you.
              Once they are an admin, only a system administrator can demote
              them. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setParticipantToToggle(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmAdminToggle}>
              Promote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((p) => {
                const isSystemAdmin = session?.user.role === Role.ADMIN;
                const isParticipantAdmin = adminSerializedIds.includes(
                  p.serializedId
                );
                return (
                  <TableRow key={p.id}>
                    <TableCell>{p.serializedId}</TableCell>
                    <TableCell>{p.pushName}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`admin-toggle-${p.id}`}
                          checked={isParticipantAdmin}
                          onCheckedChange={() =>
                            handleToggleAdmin(p.serializedId)
                          }
                          disabled={
                            !isGroupAdmin ||
                            (isParticipantAdmin && !isSystemAdmin)
                          }
                        />
                        <Label htmlFor={`admin-toggle-${p.id}`}>
                          <IconShield className="h-4 w-4" />
                        </Label>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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
    </>
  );
}
