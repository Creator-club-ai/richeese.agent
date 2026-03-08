import { ipcMain } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ensureWorkspacePath, readTextFile, writeTextFile } from './helpers.js';

export const registerFileHandlers = () => {
  ipcMain.handle('files:readText', async (_event, targetPath: string) => {
    return readTextFile(ensureWorkspacePath(targetPath));
  });

  ipcMain.handle('files:writeText', async (_event, payload: { path: string; content: string }) => {
    const resolved = ensureWorkspacePath(payload.path);
    await writeTextFile(resolved, payload.content);
    return {
      ok: true,
      message: 'File written.',
      path: resolved,
    };
  });

  ipcMain.handle('files:move', async (_event, payload: { from: string; to: string }) => {
    const from = ensureWorkspacePath(payload.from);
    const to = ensureWorkspacePath(payload.to);
    await fs.mkdir(path.dirname(to), { recursive: true });
    await fs.rename(from, to);
    return {
      ok: true,
      message: 'File moved.',
      path: to,
    };
  });
};