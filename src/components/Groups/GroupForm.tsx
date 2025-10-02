/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Groups/GroupForm.tsx
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GroupSchema } from "@/lib/schemas";
import { createGroup, updateGroup } from "@/lib/actions";
import { Group } from "@prisma/client";
import { useTransition } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";

interface GroupFormProps {
  group?: Group;
  onSuccess?: () => void;
}

type GroupFormInput = z.input<typeof GroupSchema>;
type GroupFormOutput = z.output<typeof GroupSchema>;

export default function GroupForm({ group, onSuccess }: GroupFormProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GroupFormInput>({
    resolver: zodResolver(GroupSchema),
    defaultValues: group
      ? {
          ...group,
          adminSerializedIds: group.adminSerializedIds.join(", "),
        }
      : {
          serializedId: "",
          isIgnored: false,
          adminSerializedIds: "",
        },
  });

  const onSubmit: SubmitHandler<GroupFormOutput> = (data) => {
    startTransition(async () => {
      const action = group ? updateGroup(group.id, data) : createGroup(data);
      const result = await action;
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        onSuccess?.();
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit as any)}
      className="flex flex-col max-h-[400px] overflow-auto space-y-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="serializedId">Serialized ID</Label>
        <Input id="serializedId" {...register("serializedId")} />
        {errors.serializedId && (
          <p className="text-red-500">{errors.serializedId.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="isIgnored" {...register("isIgnored")} />
        <label
          htmlFor="isIgnored"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Is Ignored
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="adminSerializedIds">
          Admin Serialized IDs (comma separated)
        </Label>
        <Textarea id="adminSerializedIds" {...register("adminSerializedIds")} />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving..." : "Save Group"}
      </Button>
    </form>
  );
}
