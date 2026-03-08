import type { ProjectDetails, ReelJobDetails, Tone } from './contracts';
import { formatStatusLabel, statusTone } from './format';

export type PostStepId = 'research' | 'planning' | 'copy' | 'design';
export type ReelStepId = 'source' | 'review' | 'clip' | 'output';

export type PostStepViewModel = {
  id: PostStepId;
  title: string;
  description: string;
  tone: Tone;
  statusLabel: string;
};

export type ReelStepViewModel = {
  id: ReelStepId;
  title: string;
  description: string;
  tone: Tone;
  statusLabel: string;
};

export type InstagramPhonePostSlide = {
  id: string;
  title: string;
  body: string[];
  accent: string;
  imageUrl?: string;
};

export type InstagramPhonePostPreviewModel = {
  username: string;
  caption: string;
  phaseLabel: string;
  slides: InstagramPhonePostSlide[];
};

export type InstagramPhoneReelPreviewModel = {
  username: string;
  caption: string;
  phaseLabel: string;
  statusLabel: string;
  badgeLabel: string;
  title: string;
  lines: string[];
  videoUrl?: string;
};

const normalizeLine = (line: string) =>
  line
    .replace(/^#{1,6}\s*/, '')
    .replace(/^[-*+]\s*/, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/[*_`>#-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const collectMeaningfulLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter((line) => line.length > 0);

const fallbackCaption = '\uc778\uc0ac\uc774\ud2b8 \uc694\uc57d\uc774 \uc5ec\uae30\uc5d0 \ud45c\uc2dc\ub429\ub2c8\ub2e4.';

export const buildPostStepViewModels = (project: ProjectDetails | null): PostStepViewModel[] => {
  const approvalStatus = project?.approvals.slidePlan.status ?? 'not_requested';

  return [
    {
      id: 'research',
      title: '\ub9ac\uc11c\uce58',
      description: '\ube0c\ub9ac\ud504 \uc815\ub9ac',
      tone: project?.paths.researchBrief ? 'accent' : 'neutral',
      statusLabel: project?.paths.researchBrief ? '\uc800\uc7a5\ub428' : '\ube44\uc5b4 \uc788\uc74c',
    },
    {
      id: 'planning',
      title: '\uae30\ud68d',
      description: '\ud50c\ub79c \uc791\uc131 \ubc0f \uc2b9\uc778',
      tone: statusTone(approvalStatus),
      statusLabel: formatStatusLabel(approvalStatus),
    },
    {
      id: 'copy',
      title: '\uce74\ud53c',
      description: '\uc2ac\ub77c\uc774\ub4dc \ubb38\uad6c \uc815\ub9ac',
      tone: project?.paths.carouselDraft || project?.paths.handoffBrief ? 'accent' : 'neutral',
      statusLabel: project?.paths.carouselDraft || project?.paths.handoffBrief ? '\ucd08\uc548 \uc791\uc131' : '\ube44\uc5b4 \uc788\uc74c',
    },
    {
      id: 'design',
      title: '\ub514\uc790\uc778',
      description: 'JSON \ubc0f \ub80c\ub354',
      tone: project?.renderAssets.length ? 'success' : project?.paths.carouselJson ? 'accent' : 'neutral',
      statusLabel: project?.renderAssets.length ? '\ub80c\ub354 \uc644\ub8cc' : project?.paths.carouselJson ? 'JSON \uc800\uc7a5' : '\ub300\uae30',
    },
  ];
};

export const buildReelStepViewModels = (reel: ReelJobDetails | null): ReelStepViewModel[] => [
  {
    id: 'source',
    title: '\uc18c\uc2a4',
    description: 'URL \ubd84\uc11d',
    tone: reel ? 'accent' : 'neutral',
    statusLabel: reel ? '\ubd84\uc11d \uc900\ube44' : '\ub300\uae30',
  },
  {
    id: 'review',
    title: '\ud6c4\ubcf4 \uac80\ud1a0',
    description: '\ud558\uc774\ub77c\uc774\ud2b8 \uc120\ud0dd',
    tone: reel ? statusTone(reel.status) : 'neutral',
    statusLabel: reel ? formatStatusLabel(reel.status) : '\ub300\uae30',
  },
  {
    id: 'clip',
    title: '\ud074\ub9bd \uc900\ube44',
    description: '\uc2b9\uc778 \ud074\ub9bd \ub2e4\uc6b4\ub85c\ub4dc',
    tone: reel?.highlightPath ? 'success' : 'neutral',
    statusLabel: reel?.highlightPath ? '\ub2e4\uc6b4\ub85c\ub4dc \uc644\ub8cc' : '\ub300\uae30',
  },
  {
    id: 'output',
    title: '\ucd9c\ub825',
    description: '\ucd5c\uc885 \ub80c\ub354',
    tone: reel?.renderedOutputPath ? 'success' : 'neutral',
    statusLabel: reel?.renderedOutputPath ? '\ucd9c\ub825 \uc644\ub8cc' : '\ub300\uae30',
  },
];

export const buildPostPreviewModel = ({
  project,
  step,
  renderAssetUrls,
  researchBrief,
  slidePlan,
  carouselDraft,
  handoffBrief,
  carouselJson,
}: {
  project: ProjectDetails | null;
  step: PostStepId;
  renderAssetUrls: string[];
  researchBrief: string;
  slidePlan: string;
  carouselDraft: string;
  handoffBrief: string;
  carouselJson: string;
}): InstagramPhonePostPreviewModel => {
  const researchLines = collectMeaningfulLines(researchBrief);
  const planLines = collectMeaningfulLines(slidePlan);
  const copyLines = collectMeaningfulLines(`${carouselDraft}\n${handoffBrief}`);
  const designLines = collectMeaningfulLines(carouselJson);

  const title = project?.title ?? '\uc0c8 \uac8c\uc2dc\ubb3c';
  const sourceLines =
    step === 'research'
      ? researchLines
      : step === 'planning'
        ? planLines
        : step === 'copy'
          ? copyLines
          : designLines.length > 0
            ? designLines
            : planLines;

  const slides: InstagramPhonePostSlide[] =
    renderAssetUrls.length > 0
      ? renderAssetUrls.map((imageUrl, index) => ({
          id: `render-${index}`,
          title,
          body: [],
          accent: index % 2 === 0 ? '\uc778\uc0ac\uc774\ud2b8' : '\ud3ec\uc2a4\ud2b8',
          imageUrl,
        }))
      : [
          {
            id: 'cover',
            title,
            body: sourceLines.slice(0, 2).length ? sourceLines.slice(0, 2) : ['\ud575\uc2ec \uba54\uc2dc\uc9c0\ub97c \uc5ec\uae30\uc5d0 \uc815\ub9ac\ud569\ub2c8\ub2e4.'],
            accent: step === 'research' ? '\ub9ac\uc11c\uce58' : step === 'planning' ? '\uae30\ud68d' : step === 'copy' ? '\uce74\ud53c' : '\ub514\uc790\uc778',
          },
          {
            id: 'body',
            title: sourceLines[2] ?? '\ud575\uc2ec \ud3ec\uc778\ud2b8',
            body: sourceLines.slice(3, 6).length ? sourceLines.slice(3, 6) : ['\uc124\uba85\uc774 \uc5ec\uae30\uc5d0 \uc2ac\ub77c\uc774\ub4dc \ud615\ud0dc\ub85c \ub178\ucd9c\ub429\ub2c8\ub2e4.'],
            accent: '\uc0c1\uc138',
          },
          {
            id: 'cta',
            title: '\ub9c8\ubb34\ub9ac',
            body: sourceLines.slice(6, 8).length ? sourceLines.slice(6, 8) : ['\ub2e4\uc74c \uc561\uc158\uacfc CTA\uac00 \uc5ec\uae30\uc5d0 \ud45c\uc2dc\ub429\ub2c8\ub2e4.'],
            accent: 'CTA',
          },
        ];

  const captionLine = sourceLines[0] ?? fallbackCaption;

  return {
    username: 'youthfounderclub',
    caption: captionLine,
    phaseLabel:
      step === 'research'
        ? '\ub9ac\uc11c\uce58 \ub77c\uc774\ube0c \ubbf8\ub9ac\ubcf4\uae30'
        : step === 'planning'
          ? '\uae30\ud68d \ub77c\uc774\ube0c \ubbf8\ub9ac\ubcf4\uae30'
          : step === 'copy'
            ? '\uce74\ud53c \ub77c\uc774\ube0c \ubbf8\ub9ac\ubcf4\uae30'
            : renderAssetUrls.length > 0
              ? '\ub80c\ub354 \uacb0\uacfc \ubbf8\ub9ac\ubcf4\uae30'
              : '\ub514\uc790\uc778 \ub77c\uc774\ube0c \ubbf8\ub9ac\ubcf4\uae30',
    slides,
  };
};

export const buildReelPreviewModel = ({
  reel,
  videoUrl,
}: {
  reel: ReelJobDetails | null;
  videoUrl: string;
}): InstagramPhoneReelPreviewModel => {
  const candidate = reel?.topCandidates[0] ?? reel?.allCandidates[0] ?? null;

  return {
    username: 'youthfounderclub',
    caption: reel?.title ?? '\ub9b4\uc2a4 \uc18c\uc2a4\ub97c \ubd84\uc11d\ud558\uba74 \ucee8\uc149\uc774 \uc5ec\uae30\uc5d0 \ud45c\uc2dc\ub429\ub2c8\ub2e4.',
    phaseLabel: videoUrl ? '\uc778\uc2a4\ud0c0 \ub9b4\uc2a4 \ubbf8\ub9ac\ubcf4\uae30' : '\ub9b4\uc2a4 \ubaa9\uc5c5',
    statusLabel: reel ? formatStatusLabel(reel.status) : '\ub300\uae30',
    badgeLabel: videoUrl
      ? reel?.highlightPath
        ? '\ud074\ub9bd \ubbf8\ub9ac\ubcf4\uae30'
        : '\ucd5c\uc885 \ucd9c\ub825'
      : '\ud50c\ub808\uc774\uc2a4\ud640\ub354',
    title: candidate?.title ?? reel?.title ?? '\ud558\uc774\ub77c\uc774\ud2b8 \uc120\ud0dd \ub300\uae30',
    lines: [
      candidate ? `${Math.floor(candidate.start)}s - ${Math.floor(candidate.end)}s` : '\ud6c4\ubcf4 \ud074\ub9bd\uc744 \uace0\ub974\uba74 \uc5ec\uae30\uc5d0 \uad6c\uac04\uc774 \ud45c\uc2dc\ub429\ub2c8\ub2e4.',
      reel?.sourceUrl ?? '\uc720\ud29c\ube0c \uc18c\uc2a4 URL \ub610\ub294 \ub80c\ub354 \uacb0\uacfc\uac00 \ub9c1\ud06c\ub429\ub2c8\ub2e4.',
    ],
    videoUrl: videoUrl || undefined,
  };
};
