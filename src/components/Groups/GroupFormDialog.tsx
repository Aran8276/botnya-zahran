"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import GroupForm from "./GroupForm";
import { Group } from "@prisma/client";

interface GroupFormDialogProps {
  children?: React.ReactNode;
  group?: Group;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GroupFormDialog({
  children,
  group,
  open,
  onOpenChange,
}: GroupFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{group ? "Edit Group" : "New Group"}</DialogTitle>
        </DialogHeader>
        <GroupForm group={group} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
