import { describe, expect, it } from 'vitest';

import { parseMarkdownSections, parsePlanningCandidates } from '../src/shared/parsers';

describe('parseMarkdownSections', () => {
  it('extracts heading blocks in order', () => {
    const markdown = [
      '# Title',
      '',
      'Intro copy',
      '',
      '## Section A',
      'Line one',
      '',
      '### Section B',
      'Line two',
    ].join('\n');

    const sections = parseMarkdownSections(markdown);

    expect(sections).toHaveLength(3);
    expect(sections[0]).toMatchObject({ heading: 'Title', level: 1, content: 'Intro copy' });
    expect(sections[1]).toMatchObject({ heading: 'Section A', level: 2, content: 'Line one' });
    expect(sections[2]).toMatchObject({ heading: 'Section B', level: 3, content: 'Line two' });
  });
});

describe('parsePlanningCandidates', () => {
  it('reads candidate plans from planning.md blocks', () => {
    const markdown = [
      '## Candidate Plans',
      '',
      '### Candidate 1',
      '- candidateId: candidate_1',
      '- workingTitle: Big Idea',
      '- packaging: standalone',
      '- reviewStatus: ready',
      '- slideCount: 7',
      '- contentAngle: Sharp angle',
      '- whyItDeservesAPost: Strong source fit',
      '- recommendedPriority: P1',
      '',
      '#### Audience',
      'Founders',
      '',
      '#### Slide Flow',
      '- Slide 1: Hook',
      '',
      '### Candidate 2',
      '- candidateId: candidate_2',
      '- workingTitle: Second Idea',
      '- packaging: umbrella',
      '- reviewStatus: hold',
      '- slideCount: 5',
      '- contentAngle: Another angle',
      '- whyItDeservesAPost: Good follow-up',
      '- recommendedPriority: P2',
      '',
      '#### Core Message',
      'A better point',
    ].join('\n');

    const candidates = parsePlanningCandidates(markdown);

    expect(candidates).toHaveLength(2);
    expect(candidates[0]).toMatchObject({
      candidateId: 'candidate_1',
      workingTitle: 'Big Idea',
      packaging: 'standalone',
    });
    expect(candidates[0].sections.Audience).toBe('Founders');
    expect(candidates[1].sections['Core Message']).toBe('A better point');
  });
});
