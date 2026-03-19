import { contextBridge, ipcRenderer } from 'electron';

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

const api = {
  getSnapshot: () => ipcRenderer.invoke('workspace:get-snapshot') as Promise<WorkspaceSnapshot>,
  chooseWorkspacePath: () => ipcRenderer.invoke('workspace:choose-path') as Promise<WorkspaceSnapshot | null>,
  readFile: (absolutePath: string) => ipcRenderer.invoke('workspace:read-file', absolutePath) as Promise<string>,
  saveFile: (payload: FilePayload) => ipcRenderer.invoke('workspace:save-file', payload) as Promise<boolean>,
  updateSourceApproval: (payload: SourceApprovalPayload) =>
    ipcRenderer.invoke('workspace:update-source-approval', payload) as Promise<WorkspaceSnapshot>,
  approveSlidePlan: (projectId: string) =>
    ipcRenderer.invoke('workspace:approve-slide-plan', projectId) as Promise<WorkspaceSnapshot>,
  setProjectStage: (projectId: string, stage: string) =>
    ipcRenderer.invoke('workspace:set-project-stage', projectId, stage) as Promise<WorkspaceSnapshot>,
  spawnApproved: (sourceId: string) =>
    ipcRenderer.invoke('workspace:spawn-approved', sourceId) as Promise<WorkspaceSnapshot>,
  runValidation: () => ipcRenderer.invoke('workspace:run-validation') as Promise<ValidationResult>,
  getProviderStatus: () => ipcRenderer.invoke('runtime:get-status') as Promise<ProviderStatus>,
  connectProvider: () => ipcRenderer.invoke('runtime:connect') as Promise<ProviderStatus>,
  runStage: (request: StageRunRequest) => ipcRenderer.invoke('runtime:run-stage', request) as Promise<StageRunResult>,
  cancelRun: (runId: string) => ipcRenderer.invoke('runtime:cancel-run', runId) as Promise<StageRunResult>,
  applyDiff: (runId: string) => ipcRenderer.invoke('runtime:apply-diff', runId) as Promise<StageRunResult>,
  discardRun: (runId: string) => ipcRenderer.invoke('runtime:discard-run', runId) as Promise<StageRunResult>,
  getAppState: () => ipcRenderer.invoke('app:get-state') as Promise<DesktopAppState>,
  openPath: (targetPath: string) => ipcRenderer.invoke('app:open-path', targetPath) as Promise<boolean>,
  openExternal: (url: string) => ipcRenderer.invoke('app:open-external', url) as Promise<boolean>,
  onSnapshot: (callback: (snapshot: WorkspaceSnapshot) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, snapshot: WorkspaceSnapshot) => {
      callback(snapshot);
    };
    ipcRenderer.on('workspace:snapshot', listener);
    return () => {
      ipcRenderer.removeListener('workspace:snapshot', listener);
    };
  },
  onRunUpdate: (callback: (result: StageRunResult) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, result: StageRunResult) => {
      callback(result);
    };
    ipcRenderer.on('runtime:run-update', listener);
    return () => {
      ipcRenderer.removeListener('runtime:run-update', listener);
    };
  },
};

contextBridge.exposeInMainWorld('contentOS', api);

export type ContentOSApi = typeof api;
