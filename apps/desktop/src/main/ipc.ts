import { dialog, ipcMain, shell, type BrowserWindow } from 'electron';

import type {
  FilePayload,
  SourceApprovalPayload,
  StageRunRequest,
} from '@shared/types';

import { AppStateStore } from './services/app-state';
import { RuntimeService } from './services/runtime';
import { WorkspaceService } from './services/workspace';

export function registerIpc(
  window: BrowserWindow,
  workspaceService: WorkspaceService,
  runtimeService: RuntimeService,
  appStateStore: AppStateStore,
): void {
  workspaceService.onSnapshot((snapshot) => {
    window.webContents.send('workspace:snapshot', snapshot);
  });

  runtimeService.onRunUpdate((result) => {
    window.webContents.send('runtime:run-update', result);
  });

  ipcMain.handle('workspace:get-snapshot', async () => {
    return workspaceService.getSnapshot() ?? workspaceService.initialize();
  });

  ipcMain.handle('workspace:choose-path', async () => {
    const result = await dialog.showOpenDialog(window, {
      properties: ['openDirectory'],
      title: 'Select content workspace',
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return workspaceService.setWorkspacePath(result.filePaths[0]);
  });

  ipcMain.handle('workspace:read-file', async (_event, absolutePath: string) => {
    return workspaceService.readTextFile(absolutePath);
  });

  ipcMain.handle('workspace:save-file', async (_event, payload: FilePayload) => {
    await workspaceService.saveTextFile(payload);
    return true;
  });

  ipcMain.handle('workspace:update-source-approval', async (_event, payload: SourceApprovalPayload) => {
    return workspaceService.updateSourceApproval(payload);
  });

  ipcMain.handle('workspace:approve-slide-plan', async (_event, projectId: string) => {
    return workspaceService.approveSlidePlan(projectId);
  });

  ipcMain.handle('workspace:set-project-stage', async (_event, projectId: string, stage: string) => {
    return workspaceService.setProjectStage(projectId, stage);
  });

  ipcMain.handle('workspace:spawn-approved', async (_event, sourceId: string) => {
    return workspaceService.spawnApproved(sourceId);
  });

  ipcMain.handle('workspace:run-validation', async () => {
    return workspaceService.runValidation();
  });

  ipcMain.handle('runtime:get-status', async () => {
    return runtimeService.getStatus();
  });

  ipcMain.handle('runtime:connect', async () => {
    return runtimeService.connect();
  });

  ipcMain.handle('runtime:run-stage', async (_event, request: StageRunRequest) => {
    return runtimeService.runStage(request);
  });

  ipcMain.handle('runtime:cancel-run', async (_event, runId: string) => {
    return runtimeService.cancelRun(runId);
  });

  ipcMain.handle('runtime:apply-diff', async (_event, runId: string) => {
    return runtimeService.applyDiff(runId);
  });

  ipcMain.handle('runtime:discard-run', async (_event, runId: string) => {
    return runtimeService.discardRun(runId);
  });

  ipcMain.handle('app:get-state', async () => {
    return appStateStore.getState();
  });

  ipcMain.handle('app:open-path', async (_event, targetPath: string) => {
    await shell.openPath(targetPath);
    return true;
  });

  ipcMain.handle('app:open-external', async (_event, url: string) => {
    await shell.openExternal(url);
    return true;
  });
}
