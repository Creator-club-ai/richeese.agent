import type { ReactNode } from 'react';

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  kicker?: string;
  accent?: ReactNode;
};

export const MetricCard = ({ label, value, detail, kicker, accent }: MetricCardProps) => {
  return (
    <article className="notion-surface" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          {kicker ? (
            <div className="notion-label" style={{ marginBottom: 4 }}>{kicker}</div>
          ) : null}
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</div>
        </div>
        {accent ? <div style={{ color: 'var(--accent)' }}>{accent}</div> : null}
      </div>
      <div style={{ marginTop: 8, fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
        {value}
      </div>
      <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-secondary)' }}>{detail}</div>
    </article>
  );
};
