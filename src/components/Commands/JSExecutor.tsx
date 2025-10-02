/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { executeJavascript } from "@/lib/actions";
import { useState } from "react";

export default function JSExecutor({ code }: { code: string }) {
  const [result, setResult] = useState<any>(null);
  // const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleRun = async () => {
    setIsLoading(true);
    setResult(null);
    // setLogs([]);
    const { result /*logs*/ } = await executeJavascript(code);
    // setLogs(logs);
    setResult(result);
    setIsLoading(false);
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleRun}
        disabled={isLoading}
        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
      >
        {isLoading ? "Running..." : "Run"}
      </button>

      <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
        <h4 className="font-semibold">Result:</h4>
        <pre className="mt-2 text-sm whitespace-pre-wrap">
          {JSON.stringify(result, null, 2)}
        </pre>
        {/* <h4 className="font-semibold mt-4">Console Logs:</h4>
        <div className="mt-2 text-sm space-y-1">
          {logs.map((log, i) => (
            <pre key={i} className="whitespace-pre-wrap">
              {log.map((arg: any) => JSON.stringify(arg, null, 2)).join(" ")}
            </pre>
          ))}
        </div> */}
      </div>
    </div>
  );
}
