import { z } from "zod";
import { OutputType, ScheduleType } from "@prisma/client";

export const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const RegisterSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
});

export const CommandSchema = z.object({
  input: z.string().min(1, "Input is required"),
  outputType: z.nativeEnum(OutputType),
  outputText: z.string().optional(),
  outputImageUrl: z.string().optional(),
  outputInbuiltCommand: z.string().optional(),
  outputJavascript: z.string().optional(),
  ownerId: z.string().optional(),
});

export const GroupSchema = z.object({
  serializedId: z.string().min(1, "Serialized ID is required"),
  isIgnored: z.boolean(),
  adminSerializedIds: z.preprocess(
    (val) =>
      typeof val === "string" && val.length > 0
        ? val.split(",").map((s) => s.trim())
        : val,
    z.array(z.string())
  ),
});

export const GroupOptionsSchema = z.object({
  groupId: z.string(),
  welcomeMessage: z.string().optional(),
  goodbyeMessage: z.string().optional(),
  enableWelcomeMessage: z.boolean(),
  enableGoodbyeMessage: z.boolean(),
  disableEveryone: z.boolean(),
  disableUnoGame: z.boolean(),
  disableBlackjackGame: z.boolean(),
  disableMarbleRunGame: z.boolean(),
  disableAi: z.boolean(),
  lockEveryoneAdmin: z.boolean(),
  scheduleCommandWeekly: z.boolean(),
});

export const GroupParticipantSchema = z.object({
  serializedId: z.string().min(1, "Serialized ID is required"),
  pushName: z.string().min(1, "Push Name is required"),
  profilePictureUrl: z.string().optional(),
});

export const ScheduleSchema = z.object({
  triggerAt: z.coerce.date(),
  scheduleType: z.nativeEnum(ScheduleType),
});
