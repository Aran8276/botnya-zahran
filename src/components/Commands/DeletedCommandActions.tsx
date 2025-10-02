// src/components/Commands/DeletedCommandActions.tsx
"use client";

import { Commands } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconDotsVertical } from "@tabler/icons-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteCommandPermanently, restoreCommand } from "@/lib/actions";
import { toast } from "sonner";

export default function DeletedCommandActions({
  command,
}: {
  command: Commands;
}) {
  const handleRestore = async () => {
    toast.promise(restoreCommand(command.id), {
      loading: "Restoring command...",
      success: "Command restored.",
      error: "Failed to restore command.",
    });
  };

  const handlePurge = async () => {
    toast.promise(deleteCommandPermanently(command.id), {
      loading: "Permanently deleting command...",
      success: "Command purged.",
      error: "Failed to purge command.",
    });
  };

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onSelect={handleRestore}>Restore</DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem variant="destructive">Purge</DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent className="flex flex-col space-y-2">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription className="pt-[3px]">
            This action cannot be undone. This will permanently delete the
            command.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/80"
            asChild
            onClick={handlePurge}
          >
            <Button variant={`destructive`}>Purge</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
