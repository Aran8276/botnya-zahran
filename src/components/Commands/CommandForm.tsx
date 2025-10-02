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
    control,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="input">Input</Label>
        <Input id="input" {...register("input")} />
        {errors.input && <p className="text-red-500">{errors.input.message}</p>}
      </div>

      <div>
        <Label htmlFor="outputType">Output Type</Label>
        <Select
          defaultValue={outputType}
          onValueChange={(value) =>
            control._form.setValue("outputType", value as OutputType)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(OutputType).map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {outputType === "TEXT" && (
        <div>
          <Label htmlFor="outputText">Output Text</Label>
          <textarea
            id="outputText"
            {...register("outputText")}
            className="w-full bg-transparent border border-input rounded-md p-2"
          />
        </div>
      )}
      {outputType === "IMAGE" && (
        <div>
          <Label htmlFor="outputImageUrl">Output Image URL</Label>
          <Input id="outputImageUrl" {...register("outputImageUrl")} />
        </div>
      )}
      {outputType === "INBUILT_COMMAND" && (
        <div>
          <Label htmlFor="outputInbuiltCommand">Inbuilt Command</Label>
          <Input
            id="outputInbuiltCommand"
            {...register("outputInbuiltCommand")}
          />
        </div>
      )}
      {outputType === "JAVASCRIPT" && (
        <div>
          <Label htmlFor="outputJavascript">Javascript Code</Label>
          <textarea
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
