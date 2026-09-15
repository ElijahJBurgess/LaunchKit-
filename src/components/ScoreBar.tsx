import { useEffect, useState } from 'react';

export function ScoreBar({ label, value }: { label: string; value: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 60);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="subscore-row">
      <span>{label}</span>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${width}%` }} />
      </div>
      <span className="subscore-num">{value}</span>
    </div>
  );
}
