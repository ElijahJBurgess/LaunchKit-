import { useAppState } from '../../../state/AppState';
import { visualsUseMockMode } from '../../../services/visualService';
import { VisualGeneratorCard } from '../components/VisualGeneratorCard';

const visualCards = [
  { type: 'strategy', title: 'Strategy Visual', description: 'Turn the full GTM strategy into one visual.', action: 'Generate visual', featured: true },
  { type: 'messaging', title: 'Messaging Visual', description: 'See how the positioning, hero, pillars, and outcomes fit together.', action: 'Generate visual' },
  { type: 'launch', title: 'Launch Visual', description: 'Interpret the three launch phases as a visual roadmap.', action: 'Generate visual' },
  { type: 'sales', title: 'Sales Visual', description: 'Map the target, pain, value, objections, and call to action.', action: 'Generate visual' },
  { type: 'marketing', title: 'Marketing Asset', description: 'Create one polished launch-ready creative from your strategy.', action: 'Create asset', featured: true },
] as const;

export function Visuals() {
  const { analysis } = useAppState();
  if (!analysis) return null;
  const mockMode = visualsUseMockMode();
  return (
    <div className="visuals-page fade-in">
      <header className="visuals-hero">
        <div>
          <span className="section-eyebrow">Strategy, made visible</span>
          <h2>Turn the plan into something you can see.</h2>
          <p>Generate only the visual you need. Each click creates one independent image and leaves the strategy untouched.</p>
        </div>
        <div className={`visual-mode-note ${mockMode ? 'is-mock' : ''}`}>
          <span>{mockMode ? 'Free mock mode' : 'On-demand AI'}</span>
          {mockMode ? 'Local placeholders · no API calls' : 'One click · one paid image request'}
        </div>
      </header>
      <div className="visual-generator-grid">
        {visualCards.map((card) => <VisualGeneratorCard key={card.type} {...card} analysis={analysis} />)}
      </div>
    </div>
  );
}
