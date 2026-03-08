import { ipcMain } from 'electron';
import { readApprovals, writeApprovals } from './helpers.js';
import type { ApprovalSnapshot } from '../../src/lib/contracts.js';

export const registerApprovalHandlers = () => {
  ipcMain.handle('approvals:get', async (_event, projectId: string) => {
    return readApprovals(projectId);
  });

  ipcMain.handle('approvals:update', async (_event, projectId: string, patch: Partial<ApprovalSnapshot>) => {
    const current = await readApprovals(projectId);
    const updated: ApprovalSnapshot = {
      slidePlan: {
        ...current.slidePlan,
        ...patch.slidePlan,
      },
      reelsHighlight: {
        ...current.reelsHighlight,
        ...patch.reelsHighlight,
      },
    };

    await writeApprovals(projectId, updated);
    return updated;
  });
};