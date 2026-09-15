import { useState } from 'react';

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API can fail (permissions, insecure context) — fail quietly.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button type="button" className="btn-link" onClick={handleCopy}>
      {copied ? 'Copied!' : label}
    </button>
  );
}
