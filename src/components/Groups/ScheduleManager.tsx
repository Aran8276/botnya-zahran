"use client";

import { GroupScheduler, Schedule } from "@prisma/client";
import { deleteSchedule } from "@/lib/actions";
import ScheduleForm from "./ScheduleForm";

type SchedulerWithSchedules = GroupScheduler & { schedules: Schedule[] };

interface ScheduleManagerProps {
  scheduler: SchedulerWithSchedules;
  groupId: string;
}

export default function ScheduleManager({
  scheduler,
  groupId,
}: ScheduleManagerProps) {
  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Scheduler</h2>
      <ScheduleForm groupSchedulerId={scheduler.id} groupId={groupId} />
      <ul className="mt-4 space-y-2">
        {scheduler.schedules.map((s) => (
          <li key={s.id} className="flex justify-between items-center py-2">
            <span>
              {s.scheduleType} @ {s.triggerAt.toLocaleString()}
            </span>
            <form action={() => deleteSchedule(s.id, groupId)}>
              <button type="submit" className="text-red-500">
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
