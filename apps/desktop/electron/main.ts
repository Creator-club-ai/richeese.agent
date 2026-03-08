import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow } from 'electron';
import { registerApprovalHandlers } from './ipc/approvals.js';
import { registerFileHandlers } from './ipc/files.js';
import { registerProjectHandlers } from './ipc/projects.js';
import { registerReelHandlers } from './ipc/reels.js';
import { registerSlideHandlers } from './ipc/slides.js';
import { registerSystemHandlers } from './ipc/system.js';
import { registerAgentHandlers } from './ipc/agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? null;
const isDev = Boolean(devServerUrl);
const rendererHtmlPath = path.resolve(__dirname, '..', '..', 'dist', 'index.html');

const createMainWindow = async () => {
  const mainWindow = new BrowserWindow({
    width: 1560,
    height: 980,
    minWidth: 1220,
    minHeight: 840,
    backgroundColor: '#191919',
    autoHideMenuBar: true,
    // macOS: hidden inset keeps traffic lights; Windows: hidden removes them entirely.
    // titleBarOverlay restores native Win32 window buttons on the right side.
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    ...(process.platform === 'win32' && {
      titleBarOverlay: {
        color: '#202020',
        symbolColor: '#999999',
        height: 44,
      },
    }),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (devServerUrl) {
    await mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    return;
  }

  await mainWindow.loadFile(rendererHtmlPath);
};

app.whenReady().then(async () => {
  registerSystemHandlers();
  registerProjectHandlers();
  registerApprovalHandlers();
  registerReelHandlers();
  registerSlideHandlers();
  registerFileHandlers();
  registerAgentHandlers();

  await createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
