import type { Tone } from '../lib/contracts';

type StatusPillProps = {
  label: string;
  tone: Tone;
};

export const StatusPill = ({ label, tone }: StatusPillProps) => {
  const toneStyles: Record<Tone, { bg: string; color: string }> = {
    neutral: { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' },
    accent: { bg: 'var(--accent-soft)', color: 'var(--accent)' },
    success: { bg: 'var(--success-soft)', color: 'var(--success)' },
    warning: { bg: 'var(--warning-soft)', color: 'var(--warning)' },
    danger: { bg: 'var(--danger-soft)', color: 'var(--danger)' },
  };

  const style = toneStyles[tone];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 22,
        padding: '0 8px',
        fontSize: 11,
        fontWeight: 500,
        borderRadius: 'var(--radius-sm)',
        background: style.bg,
        color: style.color,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
};
