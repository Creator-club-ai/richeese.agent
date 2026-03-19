import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { afterEach, describe, expect, it } from 'vitest';

import {
  parseProviderStatusOutput,
  shouldUseShellForCommand,
  snapshotAllowedOutputs,
  snapshotEquals,
} from '../src/main/services/runtime';

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirectories.map((directory) => rm(directory, { recursive: true, force: true })));
  tempDirectories.length = 0;
});

describe('snapshotAllowedOutputs', () => {
  it('captures text outputs and detects stale changes', async () => {
    const workspace = mkdtempSync(join(tmpdir(), 'content-os-workspace-'));
    tempDirectories.push(workspace);

    const projectDir = join(workspace, 'projects', 'demo');
    mkdirSync(projectDir, { recursive: true });
    writeFileSync(join(projectDir, 'carousel.json'), '{"slides":[]}\n', 'utf8');

    const first = await snapshotAllowedOutputs(workspace, 'projects/demo', ['carousel.json']);
    writeFileSync(join(projectDir, 'carousel.json'), '{"slides":[1]}\n', 'utf8');
    const second = await snapshotAllowedOutputs(workspace, 'projects/demo', ['carousel.json']);

    expect(first.size).toBe(1);
    expect(snapshotEquals(first, second)).toBe(false);
  });
});

describe('provider status parsing', () => {
  it('treats stderr login output as connected and extracts the account label', () => {
    const result = parseProviderStatusOutput('', 'Logged in using ChatGPT\n');

    expect(result.connected).toBe(true);
    expect(result.accountLabel).toBe('ChatGPT');
  });
});

describe('Windows shell detection', () => {
  it('uses a shell for cmd launchers on Windows', () => {
    expect(shouldUseShellForCommand('C:\\Users\\HP\\AppData\\Roaming\\npm\\codex.cmd', 'win32')).toBe(true);
    expect(shouldUseShellForCommand('C:\\tools\\codex.exe', 'win32')).toBe(false);
    expect(shouldUseShellForCommand('/usr/local/bin/codex', 'linux')).toBe(false);
  });
});
