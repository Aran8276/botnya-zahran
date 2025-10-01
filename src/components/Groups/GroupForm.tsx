/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Groups/GroupForm.tsx
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GroupSchema } from "@/lib/schemas";
import { createGroup, updateGroup } from "@/lib/actions";
import { Group } from "@/generated/prisma/client";
import { useTransition } from "react";

interface GroupFormProps {
  group?: Group;
}

type GroupFormInput = z.input<typeof GroupSchema>;
type GroupFormOutput = z.output<typeof GroupSchema>;

export default function GroupForm({ group }: GroupFormProps) {
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
    startTransition(() => {
      if (group) {
        updateGroup(group.id, data);
      } else {
        createGroup(data);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit as any)}
      className="space-y-6 max-w-lg"
    >
      <div>
        <label htmlFor="serializedId">Serialized ID</label>
        <input
          id="serializedId"
          {...register("serializedId")}
          className="w-full"
        />
        {errors.serializedId && (
          <p className="text-red-500">{errors.serializedId.message}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          id="isIgnored"
          type="checkbox"
          {...register("isIgnored")}
          className="h-4 w-4 rounded"
        />
        <label htmlFor="isIgnored" className="ml-2">
          Is Ignored
        </label>
      </div>

      <div>
        <label htmlFor="adminSerializedIds">
          Admin Serialized IDs (comma separated)
        </label>
        <input
          id="adminSerializedIds"
          {...register("adminSerializedIds")}
          className="w-full"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Group"}
      </button>
    </form>
  );
}