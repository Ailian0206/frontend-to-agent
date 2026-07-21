"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CodeBlockProps {
  language: string;
  filename: string;
  code: string;
  caption?: string;
  output?: string;
}

export function CodeBlock({
  language,
  filename,
  code,
  caption,
  output,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  async function copyCode(): Promise<void> {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 1_500);
  }

  return (
    <figure className="code-figure">
      <div className="code-toolbar">
        <div>
          <span className="code-language">{language}</span>
          <span className="code-filename">{filename}</span>
        </div>
        <button
          type="button"
          className="icon-button code-copy"
          onClick={copyCode}
          aria-label={copied ? "已复制代码" : "复制代码"}
          title={copied ? "已复制" : "复制代码"}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
      {output ? (
        <div className="expected-output">
          <strong>验证方法</strong>
          <pre>{output}</pre>
        </div>
      ) : null}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
