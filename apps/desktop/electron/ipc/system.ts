import { ipcMain } from 'electron';
import { getWorkspacePaths, getWorkspaceSummary, launchStudio, openWorkspacePath, resolveWorkspaceMediaUrl, runNodeScript } from './helpers.js';
import type { CommandId } from '../../src/lib/contracts.js';

export const registerSystemHandlers = () => {
  ipcMain.handle('system:getWorkspace', async () => {
    return getWorkspaceSummary();
  });

  ipcMain.handle('system:openPath', async (_event, targetPath: string) => {
    return openWorkspacePath(targetPath);
  });

  ipcMain.handle('system:resolveMediaUrl', async (_event, targetPath: string) => {
    return resolveWorkspaceMediaUrl(targetPath);
  });

  ipcMain.handle('system:runCommand', async (_event, commandId: CommandId, payload?: Record<string, unknown>) => {
    const { projectRoot, reelsRoot, reelsRendererRoot } = getWorkspacePaths();

    switch (commandId) {
      case 'workspace.openProjects':
        return openWorkspacePath(projectRoot);
      case 'workspace.openReels':
        return openWorkspacePath(reelsRoot);
      case 'reels.openStudio':
        return launchStudio();
      case 'reels.renderShort': {
        const jobId = typeof payload?.jobId === 'string' ? payload.jobId : null;
        if (!jobId) {
          throw new Error('reels.renderShort requires payload.jobId');
        }

        await runNodeScript(reelsRendererRoot, 'scripts/render-job.mjs', ['--job-id', jobId, '--targets', 'short']);
        return {
          ok: true,
          message: 'Short render completed.',
          path: `${reelsRendererRoot}\\out\\${jobId}-short.mp4`,
        };
      }
      default:
        throw new Error(`Unsupported command: ${commandId}`);
    }
  });
};
