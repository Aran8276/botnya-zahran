// server/src/scheduler.ts
import { Client, MessageMedia } from "whatsapp-web.js";
import { PrismaClient } from "@prisma/client";
import { CronJob } from "cron";
import { ScheduleType } from "@prisma/client";

const prisma = new PrismaClient();

export function initializeScheduler(client: Client) {
  new CronJob(
    "* * * * *",
    async () => {
      try {
        const now = new Date();
        const schedules = await prisma.schedule.findMany({
          where: {
            groupScheduler: {
              isEnabled: true,
              group: {
                groupOption: {
                  disableSchedules: false,
                },
              },
            },
          },
          include: {
            output: true,
            groupScheduler: {
              include: {
                group: true,
              },
            },
          },
        });

        for (const schedule of schedules) {
          if (!schedule.groupScheduler?.group) continue;

          const triggerAt = new Date(schedule.triggerAt);
          let shouldTrigger = false;

          if (schedule.scheduleType === ScheduleType.ONCE) {
            if (
              triggerAt.getMinutes() === now.getMinutes() &&
              triggerAt.getHours() === now.getHours() &&
              triggerAt.getDate() === now.getDate() &&
              triggerAt.getMonth() === now.getMonth() &&
              triggerAt.getFullYear() === now.getFullYear()
            ) {
              shouldTrigger = true;
              await prisma.schedule.delete({ where: { id: schedule.id } });
            }
          } else if (schedule.scheduleType === ScheduleType.REPEAT) {
            if (
              triggerAt.getMinutes() === now.getMinutes() &&
              triggerAt.getHours() === now.getHours()
            ) {
              shouldTrigger = true;
            }
          }

          if (shouldTrigger) {
            const chat = await client.getChatById(
              schedule.groupScheduler.group.serializedId
            );
            for (const command of schedule.output) {
              try {
                switch (command.outputType) {
                  case "TEXT":
                    await chat.sendMessage(command.outputText!);
                    break;
                  case "IMAGE":
                    if (command.outputImageUrl) {
                      const media = await MessageMedia.fromUrl(
                        command.outputImageUrl
                      );
                      await chat.sendMessage(media);
                    }
                    break;
                }
              } catch (e) {
                console.error("Error executing scheduled command:", e);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error in scheduler:", error);
      }
    },
    null,
    true,
    "Asia/Jakarta"
  ).start();

  console.log("Scheduler initialized.");
}
