// src/components/Groups/GroupOptionsForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GroupOptionsSchema } from "@/lib/schemas";
import { updateGroupOptions } from "@/lib/actions";
import { GroupOptions } from "@prisma/client";
import { useTransition } from "react";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";

interface GroupOptionsFormProps {
  groupOptions: GroupOptions;
  groupId: string;
}

export default function GroupOptionsForm({
  groupOptions,
  groupId,
}: GroupOptionsFormProps) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm<
    z.infer<typeof GroupOptionsSchema>
  >({
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
      toast.promise(updateGroupOptions(groupOptions.id, data), {
        loading: "Saving options...",
        success: "Options saved.",
        error: "Failed to save options.",
      });
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="welcomeMessage">Welcome Message</Label>
          <Input id="welcomeMessage" {...register("welcomeMessage")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="goodbyeMessage">Goodbye Message</Label>
          <Input id="goodbyeMessage" {...register("goodbyeMessage")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="enableWelcomeMessage"
            {...register("enableWelcomeMessage")}
          />
          <Label htmlFor="enableWelcomeMessage">Welcome Message</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="enableGoodbyeMessage"
            {...register("enableGoodbyeMessage")}
          />
          <Label htmlFor="enableGoodbyeMessage">Goodbye Message</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="disableEveryone" {...register("disableEveryone")} />
          <Label htmlFor="disableEveryone">Disable @everyone</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="disableUnoGame" {...register("disableUnoGame")} />
          <Label htmlFor="disableUnoGame">Disable Uno</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="disableBlackjackGame"
            {...register("disableBlackjackGame")}
          />
          <Label htmlFor="disableBlackjackGame">Disable Blackjack</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="disableMarbleRunGame"
            {...register("disableMarbleRunGame")}
          />
          <Label htmlFor="disableMarbleRunGame">Disable Marble Run</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="disableAi" {...register("disableAi")} />
          <Label htmlFor="disableAi">Disable AI</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="lockEveryoneAdmin" {...register("lockEveryoneAdmin")} />
          <Label htmlFor="lockEveryoneAdmin">Lock @everyone to Admin</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="scheduleCommandWeekly"
            {...register("scheduleCommandWeekly")}
          />
          <Label htmlFor="scheduleCommandWeekly">Weekly Schedule</Label>
        </div>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Options"}
      </Button>
    </form>
  );
}
