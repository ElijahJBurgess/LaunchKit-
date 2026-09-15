import { useNavigate } from 'react-router-dom';
import './Landing.css';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
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
          <button className="btn btn-primary" onClick={() => navigate('/onboarding')}>
            Get started →
          </button>
        </div>
        <div className="trust-row">
          <span>Product positioning</span>
          <span>Go-to-market strategy</span>
          <span>Launch execution</span>
        </div>
        <p className="landing-credit">An Elijah Burgess project</p>
      </div>
    </div>
  );
}
