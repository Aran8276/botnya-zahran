/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { GroupScheduler, Schedule, ScheduleType } from "@prisma/client";
import { deleteSchedule, createSchedule } from "@/lib/actions";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ScheduleSchema } from "@/lib/schemas";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { IconTrash } from "@tabler/icons-react";
import { Label } from "../ui/label";
import { toTitleCase } from "@/utils/to-title-case";
import { formatDateBasic, formatTime } from "@/utils/date-formatter";

type SchedulerWithSchedules = GroupScheduler & { schedules: Schedule[] };

interface ScheduleManagerProps {
  scheduler: SchedulerWithSchedules;
  groupId: string;
  schedulesDisabled: boolean;
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

export default function ScheduleManager({
  scheduler,
  groupId,
  schedulesDisabled,
}: ScheduleManagerProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ScheduleFormInput>({
    resolver: zodResolver(ScheduleSchema),
    defaultValues: {
      triggerAt: toDateTimeLocal(new Date()),
      scheduleType: ScheduleType.ONCE,
    },
  });

  const scheduleType = watch("scheduleType");

  const onSubmit: SubmitHandler<ScheduleFormOutput> = (data) => {
    startTransition(() => {
      toast.promise(createSchedule(scheduler.id, groupId, data), {
        loading: "Adding schedule...",
        success: () => {
          reset({
            triggerAt: toDateTimeLocal(new Date()),
            scheduleType: ScheduleType.ONCE,
          });
          return "Schedule added.";
        },
        error: "Failed to add schedule.",
      });
    });
  };

  const handleDelete = (id: string) => {
    startTransition(() => {
      toast.promise(deleteSchedule(id, groupId), {
        loading: "Deleting schedule...",
        success: "Schedule deleted.",
        error: "Failed to delete schedule.",
      });
    });
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit(onSubmit as any)}
        className="flex items-end gap-4"
      >
        <div className="grid flex-1 gap-2">
          <Label htmlFor="triggerAt">Trigger At</Label>
          <Input
            id="triggerAt"
            type="datetime-local"
            {...register("triggerAt")}
            disabled={schedulesDisabled}
          />
          {errors.triggerAt && (
            <p className="text-sm text-red-500">{errors.triggerAt.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="scheduleType">Type</Label>
          <Select
            defaultValue={scheduleType}
            onValueChange={(value) =>
              setValue("scheduleType", value as ScheduleType)
            }
            disabled={schedulesDisabled}
          >
            <SelectTrigger id="scheduleType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ScheduleType).map((type) => (
                <SelectItem key={type} value={type}>
                  {toTitleCase(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={isPending || schedulesDisabled}>
          {isPending ? "Adding..." : "Add Schedule"}
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trigger At</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduler.schedules.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  {s.scheduleType === "ONCE"
                    ? formatDateBasic(s.triggerAt)
                    : formatTime(s.triggerAt)}
                </TableCell>
                <TableCell>{toTitleCase(s.scheduleType)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(s.id)}
                    disabled={schedulesDisabled}
                  >
                    <IconTrash className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {scheduler.schedules.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No schedules.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
