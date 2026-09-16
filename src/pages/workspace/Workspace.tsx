import { useEffect, useState, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../state/AppState';
import { WORKSPACE_TABS, WORKSPACE_TAB_LABELS, type WorkspaceTab } from '../../types/pmm';
import { Overview } from './tabs/Overview';
import { Icp } from './tabs/Icp';
import { Positioning } from './tabs/Positioning';
import { Messaging } from './tabs/Messaging';
import { Competition } from './tabs/Competition';
import { Launch } from './tabs/Launch';
import { Content } from './tabs/Content';
import { Sales } from './tabs/Sales';
import { Visuals } from './tabs/Visuals';
import './Workspace.css';
import './tabs/tabs.css';

const TAB_COMPONENTS: Record<WorkspaceTab, ComponentType> = {
  overview: Overview,
  icp: Icp,
  positioning: Positioning,
  messaging: Messaging,
  competition: Competition,
  launch: Launch,
  content: Content,
  sales: Sales,
  visuals: Visuals,
};

export function Workspace() {
  const { businessInput, analysis, resetAll } = useAppState();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const navigate = useNavigate();

  useEffect(() => {
    if (!analysis) {
      navigate('/onboarding', { replace: true });
    }
  }, [analysis, navigate]);

  function handleRestart() {
    resetAll();
    navigate('/');
  }

  if (!analysis) return null;

  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="workspace">
      <div className="workspace-topbar no-print">
        <div className="topbar-left">
          <span className="workspace-brand">
            <b>Launch</b>Kit
          </span>
          <span className="workspace-biz">{businessInput.businessName}</span>
          <span className="status-pill">✓ Workspace ready</span>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary btn-sm" onClick={handleRestart}>
            Start a new analysis →
          </button>
        </div>
      </div>

      <div className="workspace-tabbar no-print">
        {WORKSPACE_TABS.map((tab) => (
          <button
            key={tab}
            className={`workspace-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {WORKSPACE_TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      <div className="workspace-main">
        <div className="workspace-main-head">
          <h1>{WORKSPACE_TAB_LABELS[activeTab]}</h1>
        </div>
        <ActiveComponent />
      </div>

    </div>
  );
}
