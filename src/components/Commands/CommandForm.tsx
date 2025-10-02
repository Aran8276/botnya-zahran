"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CommandSchema } from "@/lib/schemas";
import { createCommand, updateCommand } from "@/lib/actions";
import { Commands, OutputType } from "@prisma/client";
import { useTransition } from "react";
import JSExecutor from "./JSExecutor";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { toTitleCase } from "../../../utils/to-title-case";

interface CommandFormProps {
  command?: Commands;
  onSuccess?: () => void;
}

export default function CommandForm({ command, onSuccess }: CommandFormProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
            "function doCommand() {\n // your code here\n return 'Hello, World!';\n}",
          ownerId: command.ownerId ?? undefined,
        }
      : {
          input: "",
          outputType: OutputType.TEXT,
          outputText: "",
          outputImageUrl: "",
          outputInbuiltCommand: "",
          outputJavascript:
            "function doCommand() {\n // your code here\n return 'Hello, World!';\n}",
        },
  });

  const outputType = watch("outputType");

  const onSubmit = (data: z.infer<typeof CommandSchema>) => {
    startTransition(async () => {
      const action = command
        ? updateCommand(command.id, data)
        : createCommand(data);
      const result = await action;
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        onSuccess?.();
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col max-h-[400px] overflow-scroll space-y-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="input">Input</Label>
        <Input id="input" {...register("input")} />
        {errors.input && <p className="text-red-500">{errors.input.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="outputType">Output Type</Label>
        <Select
          defaultValue={outputType}
          onValueChange={(value) =>
            setValue(
              "outputType",
              value as "TEXT" | "IMAGE" | "INBUILT_COMMAND" | "JAVASCRIPT"
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(OutputType).map((type) => (
              <SelectItem key={type} value={type}>
                {toTitleCase(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {outputType === "TEXT" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="outputText">Output Text</Label>
          <Textarea
            id="outputText"
            {...register("outputText")}
            className="w-full bg-transparent border border-input rounded-md p-2"
          />
        </div>
      )}
      {outputType === "IMAGE" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="outputImageUrl">Output Image URL</Label>
          <Input id="outputImageUrl" {...register("outputImageUrl")} />
        </div>
      )}
      {outputType === "INBUILT_COMMAND" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="outputInbuiltCommand">Inbuilt Command</Label>
          <Input
            id="outputInbuiltCommand"
            {...register("outputInbuiltCommand")}
          />
        </div>
      )}
      {outputType === "JAVASCRIPT" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="outputJavascript">JavaScript Code</Label>
          <Textarea
            id="outputJavascript"
            rows={10}
            {...register("outputJavascript")}
            className="w-full font-mono bg-transparent border border-input rounded-md p-2"
          />
          <JSExecutor code={watch("outputJavascript") || ""} />
        </div>
      )}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Saving..." : "Save Command"}
      </Button>
    </form>
  );
}
