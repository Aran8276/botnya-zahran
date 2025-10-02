"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CommandSchema } from "@/lib/schemas";
import { createCommand, updateCommand } from "@/lib/actions";
import { Commands, OutputType } from "@prisma/client";
import { useTransition } from "react";
import JSExecutor from "./JSExecutor";

interface CommandFormProps {
  command?: Commands;
}

export default function CommandForm({ command }: CommandFormProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof CommandSchema>>({
    resolver: zodResolver(CommandSchema),
    defaultValues: command
      ? {
          ...command,
          outputText: command.outputText ?? "",
          outputImageUrl: command.outputImageUrl ?? "",
          outputInbuiltCommand: command.outputInbuiltCommand ?? "",
          outputJavascript:
            command.outputJavascript ??
            "function doCommand() {\n  // your code here\n  return 'Hello, World!';\n}",
          ownerId: command.ownerId ?? undefined,
        }
      : {
          input: "",
          outputType: OutputType.TEXT,
          outputText: "",
          outputImageUrl: "",
          outputInbuiltCommand: "",
          outputJavascript:
            "function doCommand() {\n  // your code here\n  return 'Hello, World!';\n}",
        },
  });

  const outputType = watch("outputType");

  const onSubmit = (data: z.infer<typeof CommandSchema>) => {
    startTransition(() => {
      if (command) {
        updateCommand(command.id, data);
      } else {
        createCommand(data);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      <div>
        <label htmlFor="input">Input</label>
        <input id="input" {...register("input")} className="w-full" />
        {errors.input && <p className="text-red-500">{errors.input.message}</p>}
      </div>

      <div>
        <label htmlFor="outputType">Output Type</label>
        <select
          id="outputType"
          {...register("outputType")}
          className="w-full text-black"
        >
          {Object.values(OutputType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {outputType === "TEXT" && (
        <div>
          <label htmlFor="outputText">Output Text</label>
          <textarea
            id="outputText"
            {...register("outputText")}
            className="w-full"
          />
        </div>
      )}

      {outputType === "IMAGE" && (
        <div>
          <label htmlFor="outputImageUrl">Output Image URL</label>
          <input
            id="outputImageUrl"
            {...register("outputImageUrl")}
            className="w-full"
          />
        </div>
      )}

      {outputType === "INBUILT_COMMAND" && (
        <div>
          <label htmlFor="outputInbuiltCommand">Inbuilt Command</label>
          <input
            id="outputInbuiltCommand"
            {...register("outputInbuiltCommand")}
            className="w-full"
          />
        </div>
      )}

      {outputType === "JAVASCRIPT" && (
        <div>
          <label htmlFor="outputJavascript">Javascript Code</label>
          <textarea
            id="outputJavascript"
            rows={10}
            {...register("outputJavascript")}
            className="w-full font-mono"
          />
          <JSExecutor code={watch("outputJavascript") || ""} />
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Command"}
      </button>
    </form>
  );
}
