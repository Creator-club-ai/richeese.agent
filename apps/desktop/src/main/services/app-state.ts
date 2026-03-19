import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import type { PersistedRunSummary } from '@shared/types';

interface StoredState {
  recentWorkspacePath: string | null;
  panelState: Record<string, unknown>;
  runs: PersistedRunSummary[];
}

const DEFAULT_STATE: StoredState = {
  recentWorkspacePath: null,
  panelState: {},
  runs: [],
};

export class AppStateStore {
  private state: StoredState = DEFAULT_STATE;

  constructor(private readonly filePath: string) {
    this.state = this.load();
  }

  getState(): StoredState {
    return this.state;
  }

  setRecentWorkspacePath(workspacePath: string): void {
    this.state = {
      ...this.state,
      recentWorkspacePath: workspacePath,
    };
    this.persist();
  }

  upsertRunSummary(summary: PersistedRunSummary): void {
    const runs = [...this.state.runs];
    const existingIndex = runs.findIndex((run) => run.runId === summary.runId);

    if (existingIndex >= 0) {
      runs[existingIndex] = summary;
    } else {
      runs.unshift(summary);
    }

    this.state = {
      ...this.state,
      runs: runs.slice(0, 50),
    };
    this.persist();
  }

  private load(): StoredState {
    try {
      const raw = readFileSync(this.filePath, 'utf8');
      return {
        ...DEFAULT_STATE,
        ...JSON.parse(raw),
      };
    } catch {
      return DEFAULT_STATE;
    }
  }

  private persist(): void {
    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, `${JSON.stringify(this.state, null, 2)}\n`, 'utf8');
  }
}
