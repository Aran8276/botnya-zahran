"use client";

import { useState } from "react";
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
import { softDeleteCommand } from "@/lib/actions";
import { toast } from "sonner";
import CommandFormDialog from "./CommandFormDialog";

export default function CommandActions({ command }: { command: Commands }) {
  const [isEditOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    toast.promise(softDeleteCommand(command.id), {
      loading: "Deleting command...",
      success: "Command moved to trash.",
      error: "Failed to delete command.",
    });
  };

  return (
    <>
      <CommandFormDialog
        command={command}
        open={isEditOpen}
        onOpenChange={setEditOpen}
      />
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
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialogTrigger asChild>
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialogContent className="flex flex-col space-y-2">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="pt-[3px]">
              This will move the command to the trash. You can restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/80"
              asChild
              onClick={handleDelete}
            >
              <Button variant={`destructive`}>Delete</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
