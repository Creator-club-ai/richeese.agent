import {
  startTransition,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from 'react';

import type {
  DesktopAppState,
  FilePayload,
  ProviderStatus,
  SourceApprovalPayload,
  StageRunRequest,
  StageRunResult,
  ValidationResult,
  WorkspaceSnapshot,
} from '@shared/types';

export function useContentOS(): {
  snapshot: WorkspaceSnapshot | null;
  providerStatus: ProviderStatus | null;
  appState: DesktopAppState | null;
  runs: StageRunResult[];
  runsById: Map<string, StageRunResult>;
  isLoading: boolean;
  chooseWorkspacePath: () => Promise<void>;
  refreshValidation: () => Promise<ValidationResult>;
  refreshProviderStatus: () => Promise<void>;
  readFile: (absolutePath: string) => Promise<string>;
  saveFile: (payload: FilePayload) => Promise<void>;
  updateSourceApproval: (payload: SourceApprovalPayload) => Promise<void>;
  approveSlidePlan: (projectId: string) => Promise<void>;
  setProjectStage: (projectId: string, stage: string) => Promise<void>;
  spawnApproved: (sourceId: string) => Promise<void>;
  connectProvider: () => Promise<void>;
  runStage: (request: StageRunRequest) => Promise<StageRunResult>;
  cancelRun: (runId: string) => Promise<void>;
  applyDiff: (runId: string) => Promise<void>;
  discardRun: (runId: string) => Promise<void>;
  openPath: (targetPath: string) => Promise<void>;
  openExternal: (url: string) => Promise<void>;
} {
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot | null>(null);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [appState, setAppState] = useState<DesktopAppState | null>(null);
  const [runsByIdState, setRunsByIdState] = useState<Map<string, StageRunResult>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const refreshAppState = useEffectEvent(async () => {
    const state = await window.contentOS.getAppState();
    startTransition(() => {
      setAppState(state);
    });
  });

  const refreshProviderStatus = useEffectEvent(async () => {
    const status = await window.contentOS.getProviderStatus();
    startTransition(() => {
      setProviderStatus(status);
    });
  });

  useEffect(() => {
    let disposed = false;

    const load = async () => {
      const [nextSnapshot, nextStatus, nextAppState] = await Promise.all([
        window.contentOS.getSnapshot(),
        window.contentOS.getProviderStatus(),
        window.contentOS.getAppState(),
      ]);

      if (disposed) {
        return;
      }

      startTransition(() => {
        setSnapshot(nextSnapshot);
        setProviderStatus(nextStatus);
        setAppState(nextAppState);
        setIsLoading(false);
      });
    };

    void load();

    const unsubscribeSnapshot = window.contentOS.onSnapshot((nextSnapshot) => {
      startTransition(() => {
        setSnapshot(nextSnapshot);
      });
    });

    const unsubscribeRunUpdate = window.contentOS.onRunUpdate((run) => {
      startTransition(() => {
        setRunsByIdState((previous) => {
          const next = new Map(previous);
          next.set(run.runId, run);
          return next;
        });
      });
      void refreshAppState();
    });

    return () => {
      disposed = true;
      unsubscribeSnapshot();
      unsubscribeRunUpdate();
    };
  }, [refreshAppState]);

  const runs = useMemo(() => {
    return Array.from(runsByIdState.values()).sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    );
  }, [runsByIdState]);

  return {
    snapshot,
    providerStatus,
    appState,
    runs,
    runsById: runsByIdState,
    isLoading,
    chooseWorkspacePath: async () => {
      const nextSnapshot = await window.contentOS.chooseWorkspacePath();
      if (nextSnapshot) {
        setSnapshot(nextSnapshot);
      }
      await refreshAppState();
      await refreshProviderStatus();
    },
    refreshValidation: async () => window.contentOS.runValidation(),
    refreshProviderStatus: async () => {
      await refreshProviderStatus();
    },
    readFile: async (absolutePath) => window.contentOS.readFile(absolutePath),
    saveFile: async (payload) => {
      await window.contentOS.saveFile(payload);
      await refreshAppState();
    },
    updateSourceApproval: async (payload) => {
      const nextSnapshot = await window.contentOS.updateSourceApproval(payload);
      setSnapshot(nextSnapshot);
      await refreshAppState();
    },
    approveSlidePlan: async (projectId) => {
      const nextSnapshot = await window.contentOS.approveSlidePlan(projectId);
      setSnapshot(nextSnapshot);
      await refreshAppState();
    },
    setProjectStage: async (projectId, stage) => {
      const nextSnapshot = await window.contentOS.setProjectStage(projectId, stage);
      setSnapshot(nextSnapshot);
      await refreshAppState();
    },
    spawnApproved: async (sourceId) => {
      const nextSnapshot = await window.contentOS.spawnApproved(sourceId);
      setSnapshot(nextSnapshot);
      await refreshAppState();
    },
    connectProvider: async () => {
      const nextStatus = await window.contentOS.connectProvider();
      setProviderStatus(nextStatus);
    },
    runStage: async (request) => {
      const result = await window.contentOS.runStage(request);
      setRunsByIdState((previous) => {
        const next = new Map(previous);
        next.set(result.runId, result);
        return next;
      });
      await refreshAppState();
      return result;
    },
    cancelRun: async (runId) => {
      const result = await window.contentOS.cancelRun(runId);
      setRunsByIdState((previous) => {
        const next = new Map(previous);
        next.set(result.runId, result);
        return next;
      });
      await refreshAppState();
    },
    applyDiff: async (runId) => {
      const result = await window.contentOS.applyDiff(runId);
      setRunsByIdState((previous) => {
        const next = new Map(previous);
        next.set(result.runId, result);
        return next;
      });
      await refreshAppState();
    },
    discardRun: async (runId) => {
      const result = await window.contentOS.discardRun(runId);
      setRunsByIdState((previous) => {
        const next = new Map(previous);
        next.set(result.runId, result);
        return next;
      });
      await refreshAppState();
    },
    openPath: async (targetPath) => {
      await window.contentOS.openPath(targetPath);
    },
    openExternal: async (url) => {
      await window.contentOS.openExternal(url);
    },
  };
}
