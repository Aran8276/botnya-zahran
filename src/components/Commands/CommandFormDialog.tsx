"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CommandForm from "./CommandForm";
import { CommandWithOwner } from "@/app/(dashboard)/commands/page";

interface CommandFormDialogProps {
  children?: React.ReactNode;
  command?: CommandWithOwner;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandFormDialog({
  children,
  command,
  open,
  onOpenChange,
}: CommandFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{command ? "Edit Command" : "New Command"}</DialogTitle>
        </DialogHeader>
        <CommandForm command={command} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
