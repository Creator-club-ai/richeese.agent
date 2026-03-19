import type {
  MarkdownSection,
  PlanningCandidate,
} from './types';

const REQUIRED_PLANNING_FIELDS = new Set([
  'candidateId',
  'workingTitle',
  'packaging',
  'reviewStatus',
  'slideCount',
  'contentAngle',
  'whyItDeservesAPost',
  'recommendedPriority',
]);

export function parseMarkdownSections(markdown: string): MarkdownSection[] {
  const lines = markdown.split(/\r?\n/);
  const sections: MarkdownSection[] = [];
  let current: MarkdownSection | null = null;

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.*)$/);
    if (match) {
      if (current) {
        current.content = current.content.trim();
        sections.push(current);
      }

      current = {
        heading: match[2].trim(),
        level: match[1].length,
        content: '',
      };
      continue;
    }

    if (current) {
      current.content += `${line}\n`;
    }
  }

  if (current) {
    current.content = current.content.trim();
    sections.push(current);
  }

  return sections;
}

export function parsePlanningCandidates(markdown: string): PlanningCandidate[] {
  const section = extractLevelSection(markdown, 2, 'Candidate Plans');
  if (!section) {
    return [];
  }

  const blocks: PlanningCandidate[] = [];
  const lines = section.split(/\r?\n/);
  let currentHeading: string | null = null;
  let currentLines: string[] = [];

  const flush = () => {
    if (!currentHeading) {
      return;
    }

    const body = currentLines.join('\n').trim();
    const sections = parseCandidateSections(body);
    const fields: Record<string, string> = {};
    const fieldRegex = /^- ([A-Za-z][A-Za-z0-9]*):\s*(.+)$/gm;

    let match: RegExpExecArray | null = null;
    while ((match = fieldRegex.exec(body)) !== null) {
      const key = match[1];
      if (!REQUIRED_PLANNING_FIELDS.has(key)) {
        continue;
      }
      fields[key] = cleanValue(match[2]);
    }

    blocks.push({
      heading: currentHeading,
      candidateId: fields.candidateId || '',
      workingTitle: fields.workingTitle,
      packaging: fields.packaging,
      reviewStatus: fields.reviewStatus,
      slideCount: fields.slideCount,
      contentAngle: fields.contentAngle,
      whyItDeservesAPost: fields.whyItDeservesAPost,
      recommendedPriority: fields.recommendedPriority,
      sections,
    });
  };

  for (const line of lines) {
    if (line.startsWith('### ')) {
      flush();
      currentHeading = line.slice(4).trim();
      currentLines = [];
      continue;
    }

    if (currentHeading) {
      currentLines.push(line);
    }
  }

  flush();
  return blocks.filter((candidate) => candidate.candidateId);
}

export function extractLevelSection(markdown: string, level: number, heading: string): string {
  const lines = markdown.split(/\r?\n/);
  const target = `${'#'.repeat(level)} ${heading}`;
  let start = -1;

  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim() === target) {
      start = index + 1;
      break;
    }
  }

  if (start === -1) {
    return '';
  }

  let end = lines.length;
  const boundary = new RegExp(`^#{1,${level}}\\s+`);

  for (let index = start; index < lines.length; index += 1) {
    if (boundary.test(lines[index])) {
      end = index;
      break;
    }
  }

  return lines.slice(start, end).join('\n').trim();
}

export function previewText(text: string, maxLength = 220): string {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= maxLength) {
    return collapsed;
  }
  return `${collapsed.slice(0, maxLength - 3)}...`;
}

function parseCandidateSections(body: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = body.split(/\r?\n/);
  let currentHeading: string | null = null;
  let currentLines: string[] = [];

  const flush = () => {
    if (!currentHeading) {
      return;
    }
    sections[currentHeading] = currentLines.join('\n').trim();
  };

  for (const line of lines) {
    if (line.startsWith('#### ')) {
      flush();
      currentHeading = line.slice(5).trim();
      currentLines = [];
      continue;
    }

    if (currentHeading) {
      currentLines.push(line);
    }
  }

  flush();
  return sections;
}

function cleanValue(value: string): string {
  return value.trim().replace(/^`|`$/g, '').replace(/^"|"$/g, '');
}
