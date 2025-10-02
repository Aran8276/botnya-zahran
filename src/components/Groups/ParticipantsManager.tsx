/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GroupParticipantSchema } from "@/lib/schemas";
import { createParticipant, deleteParticipant } from "@/lib/actions";
import { GroupParticipants } from "@prisma/client";
import { useTransition } from "react";

interface ParticipantsManagerProps {
  participants: GroupParticipants[];
  groupId: string;
}

export default function ParticipantsManager({
  participants,
  groupId,
}: ParticipantsManagerProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof GroupParticipantSchema>>({
    resolver: zodResolver(GroupParticipantSchema),
  });

  const onSubmit = (data: z.infer<typeof GroupParticipantSchema>) => {
    startTransition(() => {
      createParticipant(groupId, data).then(() => reset());
    });
  };

  return (
    <div className="p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Participants</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4 mb-4">
        <input {...register("serializedId")} placeholder="Serialized ID" />
        <input {...register("pushName")} placeholder="Push Name" />
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          {isPending ? "Adding..." : "Add"}
        </button>
      </form>
      <ul>
        {participants.map((p) => (
          <li key={p.id} className="flex justify-between items-center py-2">
            <span>
              {p.pushName} ({p.serializedId})
            </span>
            <form action={() => deleteParticipant(p.id, groupId)}>
              <button type="submit" className="text-red-500">
                Remove
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
