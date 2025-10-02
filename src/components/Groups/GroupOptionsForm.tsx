// src/components/Groups/GroupOptionsForm.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
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
  const { register, handleSubmit, control } = useForm<
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
          <Controller
            name="enableWelcomeMessage"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="enableWelcomeMessage"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="enableWelcomeMessage">Welcome Message</Label>
        </div>
        <div className="flex items-center gap-2">
          <Controller
            name="enableGoodbyeMessage"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="enableGoodbyeMessage"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="enableGoodbyeMessage">Goodbye Message</Label>
        </div>
        <div className="flex items-center gap-2">
          <Controller
            name="disableEveryone"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="disableEveryone"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="disableEveryone">Disable @everyone</Label>
        </div>
        <div className="flex items-center gap-2">
          <Controller
            name="disableUnoGame"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="disableUnoGame"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="disableUnoGame">Disable Uno</Label>
        </div>
        <div className="flex items-center gap-2">
          <Controller
            name="disableBlackjackGame"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="disableBlackjackGame"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="disableBlackjackGame">Disable Blackjack</Label>
        </div>
        <div className="flex items-center gap-2">
          <Controller
            name="disableMarbleRunGame"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="disableMarbleRunGame"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="disableMarbleRunGame">Disable Marble Run</Label>
        </div>
        <div className="flex items-center gap-2">
          <Controller
            name="disableAi"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="disableAi"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="disableAi">Disable AI</Label>
        </div>
        <div className="flex items-center gap-2">
          <Controller
            name="lockEveryoneAdmin"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="lockEveryoneAdmin"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="lockEveryoneAdmin">Lock @everyone to Admin</Label>
        </div>
        <div className="flex items-center gap-2">
          <Controller
            name="scheduleCommandWeekly"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="scheduleCommandWeekly"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
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
