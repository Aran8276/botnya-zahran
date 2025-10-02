/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ScheduleSchema } from "@/lib/schemas";
import { createSchedule } from "@/lib/actions";
import { ScheduleType } from "@prisma/client";
import { useTransition } from "react";
import { toTitleCase } from "@/utils/to-title-case";

interface ScheduleFormProps {
  groupSchedulerId: string;
  groupId: string;
}

type ScheduleFormInput = z.input<typeof ScheduleSchema>;
type ScheduleFormOutput = z.output<typeof ScheduleSchema>;

const toDateTimeLocal = (date: Date) => {
  const ten = (i: number) => (i < 10 ? "0" : "") + i;
  const YYYY = date.getFullYear();
  const MM = ten(date.getMonth() + 1);
  const DD = ten(date.getDate());
  const HH = ten(date.getHours());
  const mm = ten(date.getMinutes());
  return `${YYYY}-${MM}-${DD}T${HH}:${mm}`;
};

export default function ScheduleForm({
  groupSchedulerId,
  groupId,
}: ScheduleFormProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormInput>({
    resolver: zodResolver(ScheduleSchema),
    defaultValues: {
      triggerAt: toDateTimeLocal(new Date()),
      scheduleType: ScheduleType.ONCE,
    },
  });

  const onSubmit: SubmitHandler<ScheduleFormOutput> = (data) => {
    startTransition(() => {
      createSchedule(groupSchedulerId, groupId, data).then(() => reset());
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit as any)}
      className="flex gap-4 items-center"
    >
      <div>
        <label htmlFor="triggerAt">Trigger At</label>
        <input
          id="triggerAt"
          type="datetime-local"
          {...register("triggerAt")}
        />
      </div>
      <div>
        <label htmlFor="scheduleType">Type</label>
        <select id="scheduleType" {...register("scheduleType")}>
          {Object.values(ScheduleType).map((type) => (
            <option key={type} value={type}>
              {toTitleCase(type)}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-500 text-white px-4 py-2 rounded-md self-end disabled:opacity-50"
      >
        {isPending ? "Adding..." : "Add Schedule"}
      </button>
    </form>
  );
}
