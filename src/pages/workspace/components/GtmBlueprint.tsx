import type { VisualPlan } from '../../../lib/visualPlan';

function BlueprintNode({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={`blueprint-node ${className}`}>
      <span className="blueprint-label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function GtmBlueprint({ plan }: { plan: VisualPlan }) {
  const { blueprint } = plan;
  return (
    <section className="strategy-section" aria-labelledby="gtm-blueprint-title">
      <div className="strategy-section-head">
        <div>
          <span className="section-eyebrow">GTM at a glance</span>
          <h2 id="gtm-blueprint-title">Your GTM Blueprint</h2>
        </div>
        <span className="source-badge">Built from your strategy</span>
      </div>
      <div className="gtm-blueprint" role="img" aria-label={`Audience: ${blueprint.audience}. Problem: ${blueprint.problem}. Positioning: ${blueprint.positioning}. Message: ${blueprint.message}. Channels: ${blueprint.channels.join(', ')}. Launch: ${blueprint.launch}. Success: ${blueprint.success}.`}>
        <div className="blueprint-entry">
          <BlueprintNode label="Audience" value={blueprint.audience} className="node-audience" />
          <span className="blueprint-connector" aria-hidden="true">↓</span>
          <BlueprintNode label="Problem" value={blueprint.problem} className="node-problem" />
        </div>
        <span className="blueprint-path path-left" aria-hidden="true">→</span>
        <BlueprintNode label="Recommended position" value={blueprint.positioning} className="node-positioning" />
        <span className="blueprint-path path-right" aria-hidden="true">→</span>
        <div className="blueprint-output">
          <BlueprintNode label="Core message" value={blueprint.message} className="node-message" />
          <div className="node-channels blueprint-node">
            <span className="blueprint-label">Channels</span>
            <div className="channel-cloud">{blueprint.channels.map((channel) => <span key={channel}>{channel}</span>)}</div>
          </div>
        </div>
        <div className="blueprint-continuation" aria-hidden="true"><span /><b>EXECUTION</b><span /></div>
        <BlueprintNode label="Launch direction" value={blueprint.launch} className="node-launch" />
        <span className="blueprint-path path-bottom" aria-hidden="true">→</span>
        <BlueprintNode label="Success signal" value={blueprint.success} className="node-success" />
      </div>
    </section>
  );
}
