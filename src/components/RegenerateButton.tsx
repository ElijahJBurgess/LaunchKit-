import { useState } from 'react';

export function RegenerateButton({ onRegenerate }: { onRegenerate: () => Promise<void> | void }) {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      await onRegenerate();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="btn btn-sm btn-accent-soft regen-btn" onClick={handleClick} disabled={busy}>
      {busy ? 'Regenerating…' : 'Regenerate'}
    </button>
  );
}
