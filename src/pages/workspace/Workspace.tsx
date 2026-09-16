import { useEffect, useState, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../state/AppState';
import { WORKSPACE_TABS, WORKSPACE_TAB_LABELS, type WorkspaceTab } from '../../types/pmm';
import { downloadMarkdown, copyFullStrategy } from '../../lib/export';
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
  const [exportOpen, setExportOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!exportOpen) return;
    const close = () => setExportOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [exportOpen]);

  useEffect(() => {
    if (!analysis) {
      navigate('/onboarding', { replace: true });
    }
  }, [analysis, navigate]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  }

  function handleRestart() {
    resetAll();
    navigate('/');
  }

  async function handleCopyStrategy() {
    if (!analysis) return;
    setExportOpen(false);
    try {
      await copyFullStrategy(analysis);
      showToast('Full strategy copied');
    } catch {
      showToast('Could not copy — try downloading instead');
    }
  }

  function handleDownload() {
    if (!analysis) return;
    downloadMarkdown(analysis);
    setExportOpen(false);
    showToast('Markdown downloaded');
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
          <div className="export-dropdown">
            <button className="btn btn-ghost btn-sm" onClick={() => setExportOpen((v) => !v)}>
              Export ▾
            </button>
            {exportOpen && (
              <div className="export-dropdown-menu">
                <button onClick={handleDownload}>Download Markdown</button>
                <button onClick={handleCopyStrategy}>Copy Full Strategy</button>
              </div>
            )}
          </div>
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

      <div className={`copy-toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  );
}
