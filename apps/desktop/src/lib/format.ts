import type { ApprovalStatus, ContentType, ProjectStatus, ReelStatus, SourceType, Tone } from './contracts';

export const formatTimestamp = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '\uc2dc\uac04 \uc815\ubcf4 \uc5c6\uc74c';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatSeconds = (value: number) => {
  const total = Math.max(0, Math.floor(value));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export const statusTone = (status: ProjectStatus | ReelStatus | ApprovalStatus): Tone => {
  switch (status) {
    case 'approved':
    case 'plan_approved':
    case 'highlight_approved':
    case 'done':
      return 'success';
    case 'hold':
    case 'qa':
      return 'danger';
    case 'awaiting_plan_approval':
    case 'awaiting_highlight_approval':
    case 'pending':
      return 'warning';
    case 'rendering':
    case 'downloading_section':
    case 'designing':
    case 'writing':
      return 'accent';
    default:
      return 'neutral';
  }
};

const statusLabelMap: Record<ProjectStatus | ReelStatus | ApprovalStatus, string> = {
  not_requested: '\uc694\uccad \uc804',
  pending: '\uc2b9\uc778 \ub300\uae30',
  approved: '\uc2b9\uc778 \uc644\ub8cc',
  hold: '\ubcf4\ub958',
  draft: '\ucd08\uc548',
  planning: '\uae30\ud68d \uc911',
  awaiting_plan_approval: '\uae30\ud68d \uc2b9\uc778 \ub300\uae30',
  plan_approved: '\uae30\ud68d \uc2b9\uc778 \uc644\ub8cc',
  writing: '\uc791\uc131 \uc911',
  designing: '\ub514\uc790\uc778 \uc911',
  qa: '\uac80\uc218 \uc911',
  source_registered: '\uc18c\uc2a4 \ub4f1\ub85d',
  probed: '\ubd84\uc11d \uc644\ub8cc',
  awaiting_highlight_approval: '\ud558\uc774\ub77c\uc774\ud2b8 \uc2b9\uc778 \ub300\uae30',
  highlight_approved: '\ud558\uc774\ub77c\uc774\ud2b8 \uc2b9\uc778 \uc644\ub8cc',
  downloading_section: '\ud074\ub9bd \ub2e4\uc6b4\ub85c\ub4dc \uc911',
  rendering: '\ub80c\ub354\ub9c1 \uc911',
  done: '\uc644\ub8cc',
};

const sourceTypeLabelMap: Record<SourceType, string> = {
  provided: '\uc81c\uacf5 \uc790\ub8cc',
  researched: '\ub9ac\uc11c\uce58',
  youtube: '\uc720\ud29c\ube0c',
};

const contentTypeLabelMap: Record<ContentType, string> = {
  slide: '\uac8c\uc2dc\ubb3c',
  reels: '\ub9b4\uc2a4',
};

const reelModeLabelMap: Record<string, string> = {
  source_registered: '\uc18c\uc2a4 \ub4f1\ub85d',
  probe: '\uc18c\uc2a4 \ubd84\uc11d',
  highlight: '\ud558\uc774\ub77c\uc774\ud2b8 \uc791\uc5c5',
};

export const formatStatusLabel = (status: ProjectStatus | ReelStatus | ApprovalStatus) => statusLabelMap[status] ?? status;

export const formatSourceTypeLabel = (sourceType: SourceType) => sourceTypeLabelMap[sourceType];

export const formatContentTypeLabel = (contentType: ContentType) => contentTypeLabelMap[contentType];

export const formatModeLabel = (mode: string) => reelModeLabelMap[mode] ?? mode.replace(/[-_]+/g, ' ');
