import { useNavigate } from 'react-router-dom';
import { EXAMPLE_BUSINESS } from '../data/exampleBusiness';
import { useAppState } from '../state/AppState';
import launchKitLogo from '../assets/launchkit-logo.png';
import './Landing.css';

export function Landing() {
  const navigate = useNavigate();
  const { setBusinessInput } = useAppState();

  function openExample() {
    setBusinessInput(EXAMPLE_BUSINESS);
    navigate('/onboarding', { state: { step: 2 } });
  }

  return (
    <div className="landing">
      <header className="landing-nav fade-in">
        <img className="landing-logo" src={launchKitLogo} alt="LaunchKit" />
        <button className="landing-nav-cta" onClick={() => navigate('/onboarding')}>Get started <span>→</span></button>
      </header>

      <main className="landing-hero">
        <div className="landing-orbit landing-orbit-top" aria-hidden="true" />
        <div className="landing-orbit landing-orbit-bottom" aria-hidden="true" />
        <div className="landing-dots landing-dots-right" aria-hidden="true" />
        <div className="landing-dots landing-dots-left" aria-hidden="true" />

        <div className="landing-inner fade-in">
          <span className="intake-kicker">AI Product Marketing Manager</span>
          <h1 className="landing-title">
            Turn any business into
            <br />a <em>go-to-market</em> plan.
          </h1>
          <p className="landing-sub">
            Strategy. Messaging. Launch. All in one place. Tell LaunchKit about your product and it thinks
            through positioning, ICP, messaging, competition, and launch like a product marketing manager would.
          </p>
          <div className="landing-actions">
            <button className="landing-primary" onClick={() => navigate('/onboarding')}>Get started <span>→</span></button>
            <button className="landing-secondary" onClick={openExample}>See example output</button>
          </div>
          <div className="trust-row" aria-label="LaunchKit capabilities">
            <span>Product positioning</span>
            <span>Go-to-market strategy</span>
            <span>Launch execution</span>
          </div>
          <p className="landing-credit"><span />An Elijah Burgess project<span /></p>
        </div>
      </main>
    </div>
  );
}
