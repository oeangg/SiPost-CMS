"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

type CopyContentButtonProps = {
  text: string;
  className?: string;
};

export function CopyContentButton({ text, className }: CopyContentButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className={className}
      onClick={handleCopy}
      disabled={!text.trim()}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {copied ? "Tersalin" : "Copy Teks Konten"}
    </Button>
  );
}
