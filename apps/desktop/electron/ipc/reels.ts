import { ipcMain } from 'electron';
import path from 'node:path';
import {
  launchStudio,
  listReelJobs,
  readApprovals,
  readJson,
  readProjectMeta,
  readReelJob,
  runNodeScript,
  upsertProjectFromReel,
  writeApprovals,
  writeJson,
  writeProjectMeta,
  getWorkspacePaths,
  fileExists,
} from './helpers.js';

const getManifestPath = (jobId: string) => {
  const { reelsRoot } = getWorkspacePaths();
  return path.join(reelsRoot, jobId, 'manifest.json');
};

export const registerReelHandlers = () => {
  ipcMain.handle('reels:listJobs', async () => {
    return listReelJobs();
  });

  ipcMain.handle('reels:getJob', async (_event, jobId: string) => {
    return readReelJob(jobId);
  });

  ipcMain.handle('reels:probeYoutube', async (_event, jobId: string, url: string) => {
    const { reelsRendererRoot } = getWorkspacePaths();
    await runNodeScript(reelsRendererRoot, 'scripts/pipeline-youtube.mjs', [
      '--job-id',
      jobId,
      '--url',
      url,
      '--probe-only',
      'true',
    ]);

    const job = await readReelJob(jobId);
    const approvals = await readApprovals(jobId);
    approvals.reelsHighlight = {
      ...approvals.reelsHighlight,
      status: 'pending',
      reason: null,
      approver: null,
      approvedAt: null,
      candidateIndex: null,
    };
    await writeApprovals(jobId, approvals);
    await upsertProjectFromReel(job, { status: 'awaiting_highlight_approval' });
    return readReelJob(jobId);
  });

  ipcMain.handle('reels:rankHighlights', async (_event, jobId: string) => {
    const { reelsRendererRoot } = getWorkspacePaths();
    await runNodeScript(reelsRendererRoot, 'scripts/rank-highlight-candidates.mjs', ['--job-id', jobId]);
    const job = await readReelJob(jobId);
    await upsertProjectFromReel(job, { status: 'awaiting_highlight_approval' });
    return job;
  });

  ipcMain.handle('reels:approveHighlight', async (_event, jobId: string, candidateIndex: number, approver: string) => {
    const manifestPath = getManifestPath(jobId);
    const manifest = await readJson<Record<string, any>>(manifestPath);
    manifest.approvedHighlight = {
      candidateIndex,
      approvedBy: approver,
      approvedAt: new Date().toISOString(),
    };
    await writeJson(manifestPath, manifest);

    const approvals = await readApprovals(jobId);
    approvals.reelsHighlight = {
      ...approvals.reelsHighlight,
      status: 'approved',
      approver,
      approvedAt: new Date().toISOString(),
      reason: null,
      candidateIndex,
    };
    await writeApprovals(jobId, approvals);

    const job = await readReelJob(jobId);
    await upsertProjectFromReel(job, { status: 'highlight_approved' });
    return job;
  });

  ipcMain.handle('reels:downloadApprovedHighlight', async (_event, jobId: string) => {
    const manifestPath = getManifestPath(jobId);
    const manifest = await readJson<Record<string, any>>(manifestPath);
    const candidateIndex = manifest.approvedHighlight?.candidateIndex;

    if (typeof candidateIndex !== 'number') {
      throw new Error('No approved highlight found. Approve a candidate before downloading.');
    }

    const { reelsRendererRoot } = getWorkspacePaths();
    await runNodeScript(reelsRendererRoot, 'scripts/download-highlight.mjs', [
      '--job-id',
      jobId,
      '--candidate-index',
      String(candidateIndex),
    ]);

    const job = await readReelJob(jobId);
    await upsertProjectFromReel(job, { status: 'highlight_approved' });
    return job;
  });

  ipcMain.handle('reels:renderShort', async (_event, jobId: string) => {
    const manifestPath = getManifestPath(jobId);
    const manifest = await readJson<Record<string, any>>(manifestPath);
    const approvedIndex = manifest.approvedHighlight?.candidateIndex;
    const highlightFile = manifest.selectedHighlight?.outputFile;

    if (typeof approvedIndex !== 'number') {
      throw new Error('Rendering is blocked until a highlight is approved.');
    }

    if (!highlightFile) {
      throw new Error('Download the approved highlight before rendering.');
    }

    const { reelsRendererRoot } = getWorkspacePaths();
    await runNodeScript(reelsRendererRoot, 'scripts/render-job.mjs', [
      '--job-id',
      jobId,
      '--targets',
      'short',
    ]);

    const job = await readReelJob(jobId);
    await upsertProjectFromReel(job, { status: (await fileExists(job.outputPath ?? '')) ? 'done' : 'rendering' });
    return job;
  });

  ipcMain.handle('reels:openStudio', async () => {
    return launchStudio();
  });
};