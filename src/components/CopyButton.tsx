"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function CopyButton({ code }: { code: string }) {
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
    <button
      type="button"
      className="icon-button code-copy"
      onClick={copyCode}
      aria-label={copied ? "已复制代码" : "复制代码"}
      title={copied ? "已复制" : "复制代码"}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
}
