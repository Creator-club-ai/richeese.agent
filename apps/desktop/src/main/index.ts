import path from 'node:path';

import { app, BrowserWindow } from 'electron';
import started from 'electron-squirrel-startup';

import { registerIpc } from './ipc';
import { AppStateStore } from './services/app-state';
import { RuntimeService } from './services/runtime';
import { WorkspaceService } from './services/workspace';

if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

async function createWindow(): Promise<void> {
  const userDataPath = app.getPath('userData');
  const appStateStore = new AppStateStore(path.join(userDataPath, 'content-os-state.json'));
  const defaultWorkspacePath = resolveDefaultWorkspacePath(appStateStore);
  const workspaceService = new WorkspaceService(defaultWorkspacePath, appStateStore);
  const runtimeService = new RuntimeService(userDataPath, appStateStore, workspaceService);
  await workspaceService.initialize();

  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1280,
    minHeight: 840,
    backgroundColor: '#f8fafc',
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  registerIpc(mainWindow, workspaceService, runtimeService, appStateStore);

  if (process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

function resolveDefaultWorkspacePath(appStateStore: AppStateStore): string {
  const storedWorkspace = appStateStore.getState().recentWorkspacePath;
  if (storedWorkspace) {
    return storedWorkspace;
  }

  if (process.env.CONTENT_OS_WORKSPACE) {
    return process.env.CONTENT_OS_WORKSPACE;
  }

  return path.resolve(app.getAppPath(), '..', '..');
}

app.whenReady().then(() => {
  void createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
