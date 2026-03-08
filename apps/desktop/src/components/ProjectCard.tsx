import type { ProjectSummary } from '../lib/contracts';
import { formatContentTypeLabel, formatSourceTypeLabel, formatStatusLabel, formatTimestamp, statusTone } from '../lib/format';
import { StatusPill } from './StatusPill';

type ProjectCardProps = {
  project: ProjectSummary;
  selected: boolean;
  onSelect: () => void;
};

export const ProjectCard = ({ project, selected, onSelect }: ProjectCardProps) => {
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
        <span className="notion-label">{formatContentTypeLabel(project.contentType)}</span>
        <StatusPill label={formatStatusLabel(project.status)} tone={statusTone(project.status)} />
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
        {project.title}
      </h3>

      <p
        style={{
          marginTop: 2,
          fontSize: 12,
          color: 'var(--text-tertiary)',
        }}
      >
        {formatSourceTypeLabel(project.sourceType)} · {project.owner}
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
        <span>{`${project.fileCount}개 파일`}</span>
        <span>{formatTimestamp(project.updatedAt)}</span>
      </div>
    </button>
  );
};
