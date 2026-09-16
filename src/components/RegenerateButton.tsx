import { useState } from 'react';

export function RegenerateButton({ onRegenerate }: { onRegenerate: () => Promise<void> | void }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    setError(null);
    try {
      await onRegenerate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not regenerate. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <span>
    <button type="button" className="btn btn-sm btn-accent-soft regen-btn" onClick={handleClick} disabled={busy}>
      {busy ? 'Regenerating…' : 'Regenerate'}
    </button>
    {error && <span role="alert" className="error-note" style={{ display: 'block', marginTop: '0.5rem' }}>{error}</span>}
    </span>
  );
}
