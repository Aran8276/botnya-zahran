/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GroupOptionsSchema } from "@/lib/schemas";
import { updateGroupOptions } from "@/lib/actions";
import { GroupOptions } from "@/generated/prisma/client";
import { useTransition } from "react";

interface GroupOptionsFormProps {
  groupOptions: GroupOptions;
  groupId: string;
}

export default function GroupOptionsForm({
  groupOptions,
  groupId,
}: GroupOptionsFormProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof GroupOptionsSchema>>({
    resolver: zodResolver(GroupOptionsSchema),
    defaultValues: {
      ...groupOptions,
      groupId,
      welcomeMessage: groupOptions.welcomeMessage ?? "",
      goodbyeMessage: groupOptions.goodbyeMessage ?? "",
    },
  });

  const onSubmit = (data: z.infer<typeof GroupOptionsSchema>) => {
    startTransition(() => {
      updateGroupOptions(groupOptions.id, data);
    });
  };

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Group Options</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="welcomeMessage">Welcome Message</label>
          <input
            id="welcomeMessage"
            {...register("welcomeMessage")}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="goodbyeMessage">Goodbye Message</label>
          <input
            id="goodbyeMessage"
            {...register("goodbyeMessage")}
            className="w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register("enableWelcomeMessage")} />
            <span>Enable Welcome</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register("enableGoodbyeMessage")} />
            <span>Enable Goodbye</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register("disableEveryone")} />
            <span>Disable @everyone</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register("disableUnoGame")} />
            <span>Disable Uno</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register("disableBlackjackGame")} />
            <span>Disable Blackjack</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register("disableMarbleRunGame")} />
            <span>Disable Marble Run</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register("disableAi")} />
            <span>Disable AI</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register("lockEveryoneAdmin")} />
            <span>Lock to Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register("scheduleCommandWeekly")} />
            <span>Schedule Weekly</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Options"}
        </button>
      </form>
    </div>
  );
}
