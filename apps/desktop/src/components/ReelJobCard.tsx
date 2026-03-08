import type { ReelJobSummary } from '../lib/contracts';
import { formatModeLabel, formatStatusLabel, formatTimestamp, statusTone } from '../lib/format';
import { StatusPill } from './StatusPill';

type ReelJobCardProps = {
  reel: ReelJobSummary;
  selected: boolean;
  onSelect: () => void;
};

export const ReelJobCard = ({ reel, selected, onSelect }: ReelJobCardProps) => {
  return (
    <button
      onClick={onSelect}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '10px 12px',
        background: selected ? 'rgba(255,255,255,0.05)' : 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'background var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.background = 'transparent';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span className="notion-label">{formatModeLabel(reel.mode)}</span>
        <StatusPill label={formatStatusLabel(reel.status)} tone={statusTone(reel.status)} />
      </div>

      <h3
        style={{
          marginTop: 6,
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.4,
        }}
      >
        {reel.title}
      </h3>

      <p style={{ marginTop: 2, fontSize: 12, color: 'var(--text-tertiary)' }}>
        {`후보 ${reel.candidateCount}개 · 승인 ${reel.approvedCandidateIndex ?? '없음'}`}
      </p>

      <div
        style={{
          marginTop: 6,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--text-tertiary)',
        }}
      >
        <span>{reel.jobId}</span>
        <span>{formatTimestamp(reel.updatedAt)}</span>
      </div>
    </button>
  );
};
