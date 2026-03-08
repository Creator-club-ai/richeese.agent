import type { Tone } from '../lib/contracts';
import { formatTimestamp } from '../lib/format';

type ActivityEntry = {
  id: string;
  title: string;
  detail: string;
  tone: Tone;
  createdAt: string;
};

type ActivityFeedProps = {
  items: ActivityEntry[];
};

export const ActivityFeed = ({ items }: ActivityFeedProps) => {
  const toneColor: Record<Tone, string> = {
    neutral: 'var(--text-tertiary)',
    accent: 'var(--accent)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger: 'var(--danger)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {items.map((item) => (
        <article
          key={item.id}
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            borderLeft: `2px solid ${toneColor[item.tone]}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <h4 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{item.title}</h4>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
              {formatTimestamp(item.createdAt)}
            </div>
          </div>
          <p style={{ marginTop: 4, fontSize: 12, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            {item.detail}
          </p>
        </article>
      ))}
    </div>
  );
};
