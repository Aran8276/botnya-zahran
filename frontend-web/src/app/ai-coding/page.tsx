"use client";

import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import Code from "@/components/Code";
import LoadingSpinner from "@/components/spinner";
import { TextResponse } from "@/components/types/type";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import axios, { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function Page() {
  const apiKey = process.env.NEXT_PUBLIC_SAMBANOVA_API_KEY;
  const [error, setError] = useState("");
  const [codeHasError, setCodeHasError] = useState<boolean | "indeterminate">(
    false
  );
  const [codeError, setCodeError] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [programmingLanguage, setProgrammingLanguage] = useState("");
  const [isPgOther, setIsPgOther] = useState(false);
  const [otherPg, setOtherPg] = useState("");
  const [output, setOutput] = useState("");
  const [textCode, setCode] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isOutputVisible, setIsOutputVisible] = useState(false);

  const submit = async () => {
    console.log(textCode);
    console.log(programmingLanguage);
    if (!prompt) {
      setError("Silahkan isi perintah.");
      return;
    }

    if (textCode && !programmingLanguage) {
      setError("Silahkan pilih bahasa pemrograman.");
      return;
    }

    if (isPgOther && !otherPg) {
      setError("Silahkan pilih bahasa pemrograman lainnya.");
      return;
    }

    if (codeHasError && !codeError) {
      setError("Silahkan isi error kode.");
      return;
    }

    if (codeHasError && !textCode) {
      setError("Silahkan isi kode referensi.");
      return;
    }

    if (!programmingLanguage) {
      setError("Silahkan pilih bahasa pemrograman.");
      return;
    }

    try {
      setError("");
      setIsLoading(true);

      const res = await axios.post(`/api/submit`, {
        textCode: textCode ? textCode : false,
        prompt: prompt,
        apiKey: apiKey,
        programmingLanguage:
          programmingLanguage == "other" ? otherPg : programmingLanguage,
        codeHasError: codeHasError,
        codeError: codeError,
      });
      const data: TextResponse = res.data;

      setOutput(data.choices[0].message.content);
    } catch (error) {
      if (error instanceof AxiosError) console.log(error.message);
    } finally {
      setIsOutputVisible(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (programmingLanguage == "other") {
      setIsPgOther(true);
      return;
    }
    setIsPgOther(false);
  }, [programmingLanguage]);

  useEffect(() => {
    if (!codeHasError) {
      setCodeError("");
    }
  }, [codeHasError]);

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col space-y-6 p-6">
        <div className="flex flex-col space-y-1">
          <h2 className="text-3xl font-semibold">AI Chat Coding</h2>
        </div>

        <div className="flex flex-col space-y-4">
          <Select onValueChange={setProgrammingLanguage}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Pilih bahasa pemrograman" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>JavaScript</SelectLabel>
                <SelectItem value="js">JS</SelectItem>
                <SelectItem value="jsx">JSX</SelectItem>
                <SelectItem value="ts">TS</SelectItem>
                <SelectItem value="tsx">TSX</SelectItem>
                <SelectLabel>Lainnya</SelectLabel>
                <SelectItem value="py">Python</SelectItem>
                <SelectItem value="php">PHP</SelectItem>
                <SelectItem value="c">C</SelectItem>
                <SelectItem value="cs">C#</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="other">Lainnya</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {isPgOther && (
            <Input
              placeholder="Ketik bahasa pemrograman"
              className="w-[240px]"
              onChange={(e) => setOtherPg(e.target.value)}
            />
          )}
          <Textarea
            value={textCode}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Referensi Codingan (boleh kosong)"
            className="h-[400px] resize-none"
          />
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Perintah"
            className="h-[80px] resize-none"
          />
          <div className="flex items-center space-x-2">
            <Checkbox onCheckedChange={setCodeHasError} id="codeError" />
            <label
              htmlFor="codeError"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Kodingan ini memiliki error
            </label>
          </div>
          {codeHasError && (
            <Textarea
              required
              value={codeError}
              onChange={(e) => setCodeError(e.target.value)}
              placeholder="Pesan error"
              className="h-[80px]"
            />
          )}

          {error && <span className="text-red-500 text-sm">{error}</span>}

          <div className="flex space-x-3 pb-6">
            {loading ? (
              <Button disabled>
                <LoadingSpinner />
              </Button>
            ) : (
              <Button onClick={submit}>Kirim Pesan</Button>
            )}
          </div>

          {isOutputVisible && (
            <>
              {loading ? (
                <div className="flex flex-col space-y-8 bg-gray-100 p-6 rounded-xl">
                  <Skeleton className="h-4 w-[200px]" />
                  <div className="flex flex-col space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex flex-col space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-10/12" />
                  </div>
                  <div className="flex flex-col space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-3 bg-gray-100 p-6 rounded-xl">
                  <h3 className="text-xl font-bold">Output</h3>
                  <Code markdown={output} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
