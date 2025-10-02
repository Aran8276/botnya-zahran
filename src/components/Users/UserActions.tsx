"use client";

import { Role, User } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
import { deleteUser, updateUserRole } from "@/lib/actions";
import { toast } from "sonner";
import { useState } from "react";
import { toTitleCase } from "@/utils/to-title-case";

export default function UserActions({ user }: { user: User }) {
  const [currentRole, setCurrentRole] = useState(user.role);

  const handleDelete = async () => {
    toast.promise(deleteUser(user.id), {
      loading: "Deleting user...",
      success: "User deleted.",
      error: "Failed to delete user.",
    });
  };

  const handleRoleChange = async (role: Role) => {
    toast.promise(updateUserRole(user.id, role), {
      loading: "Updating role...",
      success: (res) => {
        if (res.success) {
          setCurrentRole(role);
          return res.success;
        }
        throw new Error(res.error);
      },
      error: (err) => err.message || "Failed to update role.",
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
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Change Role</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={currentRole}
                onValueChange={(value) => handleRoleChange(value as Role)}
              >
                {Object.values(Role).map((role) => (
                  <DropdownMenuRadioItem key={role} value={role}>
                    {toTitleCase(role)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

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
            This action cannot be undone. This will permanently delete the user
            and all associated data.
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
  );
}
