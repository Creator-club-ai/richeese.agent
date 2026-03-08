import { ipcMain } from 'electron';
import path from 'node:path';
import {
  fileExists,
  getWorkspacePaths,
  readApprovals,
  readProjectDetails,
  readProjectMeta,
  runNodeScript,
  writeApprovals,
  writeProjectMeta,
  writeTextFile,
} from './helpers.js';

export const registerSlideHandlers = () => {
  ipcMain.handle('slides:createPlan', async (_event, projectId: string, payload: { markdown: string }) => {
    const project = await readProjectDetails(projectId);
    await writeTextFile(path.join(project.path, 'slide_plan.md'), payload.markdown);
    await writeProjectMeta(projectId, {
      ...(await readProjectMeta(projectId)),
      status: 'planning',
      updatedAt: new Date().toISOString(),
    });
    return readProjectDetails(projectId);
  });

  ipcMain.handle('slides:markAwaitingApproval', async (_event, projectId: string) => {
    const approvals = await readApprovals(projectId);
    approvals.slidePlan = {
      ...approvals.slidePlan,
      status: 'pending',
      reason: null,
    };
    await writeApprovals(projectId, approvals);
    await writeProjectMeta(projectId, {
      ...(await readProjectMeta(projectId)),
      status: 'awaiting_plan_approval',
      updatedAt: new Date().toISOString(),
    });
    return readProjectDetails(projectId);
  });

  ipcMain.handle('slides:approvePlan', async (_event, projectId: string, approver: string) => {
    const approvals = await readApprovals(projectId);
    approvals.slidePlan = {
      ...approvals.slidePlan,
      status: 'approved',
      approver,
      approvedAt: new Date().toISOString(),
      reason: null,
    };
    await writeApprovals(projectId, approvals);
    await writeProjectMeta(projectId, {
      ...(await readProjectMeta(projectId)),
      status: 'plan_approved',
      updatedAt: new Date().toISOString(),
    });
    return readProjectDetails(projectId);
  });

  ipcMain.handle('slides:holdPlan', async (_event, projectId: string, reason: string) => {
    const approvals = await readApprovals(projectId);
    approvals.slidePlan = {
      ...approvals.slidePlan,
      status: 'hold',
      reason,
      approvedAt: null,
    };
    await writeApprovals(projectId, approvals);
    await writeProjectMeta(projectId, {
      ...(await readProjectMeta(projectId)),
      status: 'awaiting_plan_approval',
      updatedAt: new Date().toISOString(),
    });
    return readProjectDetails(projectId);
  });

  ipcMain.handle('slides:renderProject', async (_event, projectId: string) => {
    const project = await readProjectDetails(projectId);

    if (project.approvals.slidePlan.status !== 'approved') {
      throw new Error('슬라이드 렌더는 기획 승인 후에만 실행할 수 있습니다.');
    }

    const carouselJsonPath = path.join(project.path, 'carousel.json');
    if (!(await fileExists(carouselJsonPath))) {
      throw new Error('carousel.json을 저장한 뒤 렌더를 실행해 주세요.');
    }

    const { slideRendererRoot } = getWorkspacePaths();
    const currentMeta = await readProjectMeta(projectId);

    await writeProjectMeta(projectId, {
      ...currentMeta,
      status: 'designing',
      updatedAt: new Date().toISOString(),
    });

    try {
      await runNodeScript(slideRendererRoot, 'scripts/render.js', [
        '--data',
        carouselJsonPath,
        '--output',
        path.join(project.path, 'renders'),
        '--skip-build',
      ]);

      await writeProjectMeta(projectId, {
        ...(await readProjectMeta(projectId)),
        status: 'done',
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      await writeProjectMeta(projectId, {
        ...(await readProjectMeta(projectId)),
        status: 'plan_approved',
        updatedAt: new Date().toISOString(),
      });
      throw error;
    }

    return readProjectDetails(projectId);
  });
};
