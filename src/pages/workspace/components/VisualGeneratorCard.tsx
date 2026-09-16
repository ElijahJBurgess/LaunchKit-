import { useState } from 'react';
import type { PMMAnalysis } from '../../../types/pmm';
import { generateVisualAsset, type VisualType } from '../../../services/visualService';

interface Props {
  type: VisualType;
  title: string;
  description: string;
  action: string;
  analysis: PMMAnalysis;
  featured?: boolean;
}

export function VisualGeneratorCard({ type, title, description, action, analysis, featured = false }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try { setImageUrl(await generateVisualAsset(type, analysis)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not generate this visual.'); }
    finally { setBusy(false); }
  }

  return (
    <article className={`visual-generator-card ${featured ? 'is-featured' : ''} ${imageUrl ? 'has-image' : ''}`}>
      <div className="visual-card-head">
        <div>
          <span className="visual-card-index">{type === 'marketing' ? 'ASSET' : 'VISUAL'}</span>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {!imageUrl && !busy && <button className="btn btn-accent" onClick={generate}>{action}</button>}
      </div>
      {busy && (
        <div className="visual-loading" role="status" aria-live="polite">
          <span className="visual-loader-mark"><i /><i /><i /></span>
          <div><strong>Creating your {type === 'marketing' ? 'marketing asset' : `${title.toLowerCase()}…`}</strong><small>One image request is in progress.</small></div>
        </div>
      )}
      {error && (
        <div className="visual-error" role="alert">
          <p>{error}</p>
          <button className="btn btn-ghost btn-sm" onClick={generate}>Retry</button>
        </div>
      )}
      {imageUrl && !busy && (
        <div className="visual-result">
          <img src={imageUrl} alt={`${title} generated from the current LaunchKit strategy`} />
          <div className="visual-result-footer">
            <span>Creative interpretation — strategy data remains the source of truth.</span>
            <button className="btn btn-ghost btn-sm" onClick={generate}>Regenerate visual</button>
          </div>
        </div>
      )}
    </article>
  );
}
