import { useState } from 'react';
import { useAppState } from '../../../state/AppState';
import { CONTENT_ASSET_LABELS, type ContentAssetKey } from '../../../types/pmm';
import { CopyButton } from '../../../components/CopyButton';
import { RegenerateButton } from '../../../components/RegenerateButton';

export function Content() {
  const { analysis, regenerateSection } = useAppState();
  const [expanded, setExpanded] = useState<ContentAssetKey | null>('landingPage');
  if (!analysis) return null;
  const { content } = analysis;
  const keys = Object.keys(content) as ContentAssetKey[];

  return (
    <div className="panel fade-in">
      <div className="panel-head">
        <h2>Content</h2>
        <RegenerateButton onRegenerate={() => regenerateSection('content')} />
      </div>
      <div className="asset-grid">
        {keys.map((key) => {
          const isOpen = expanded === key;
          return (
            <div className={`asset-card ${isOpen ? 'open' : ''}`} key={key}>
              <button className="asset-title" onClick={() => setExpanded(isOpen ? null : key)}>
                {CONTENT_ASSET_LABELS[key]}
                <span className="asset-chevron">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="asset-body-wrap">
                  <div className="asset-body">{content[key]}</div>
                  <div className="asset-actions">
                    <CopyButton text={content[key]} />
                    <RegenerateButton onRegenerate={() => regenerateSection('content')} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
