import React, { useEffect, useState } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypePrettyCode from "rehype-pretty-code";
import { transformerCopyButton } from "@rehype-pretty/transformers";

interface SelfProps {
  markdown: string;
}

const Code = (props: SelfProps) => {
  const [html, setHtml] = useState("");

  useEffect(() => {
    const processMarkdown = async () => {
      const file = await unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypePrettyCode, {
          transformers: [
            transformerCopyButton({
              visibility: "hover",
              feedbackDuration: 3_000,
            }),
          ],
        })
        .use(rehypeStringify)
        .process(props.markdown);

      setHtml(String(file));
    };

    processMarkdown();
  }, [props.markdown]);

  return (
    <div
      className="flex flex-col space-y-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default Code;
