import { contextBridge, ipcRenderer } from 'electron';
import type {
  AgentInstallCheck,
  AgentLogEntry,
  AgentRunPayload,
  ApprovalSnapshot,
  CommandId,
  FileMovePayload,
  FileWritePayload,
  OpsApi,
  ProjectCreatePayload,
  ProjectUpdatePayload,
  SlidePlanPayload,
} from '../src/lib/contracts.js';

const api: OpsApi = {
  system: {
    getWorkspace: () => ipcRenderer.invoke('system:getWorkspace'),
    openPath: (targetPath: string) => ipcRenderer.invoke('system:openPath', targetPath),
    runCommand: (commandId: CommandId, payload?: Record<string, unknown>) =>
      ipcRenderer.invoke('system:runCommand', commandId, payload),
    resolveMediaUrl: (targetPath: string) => ipcRenderer.invoke('system:resolveMediaUrl', targetPath),
  },
  projects: {
    list: () => ipcRenderer.invoke('projects:list'),
    get: (projectId: string) => ipcRenderer.invoke('projects:get', projectId),
    create: (payload: ProjectCreatePayload) => ipcRenderer.invoke('projects:create', payload),
    updateMeta: (projectId: string, payload: ProjectUpdatePayload) =>
      ipcRenderer.invoke('projects:updateMeta', projectId, payload),
  },
  approvals: {
    get: (projectId: string) => ipcRenderer.invoke('approvals:get', projectId),
    update: (projectId: string, payload: Partial<ApprovalSnapshot>) =>
      ipcRenderer.invoke('approvals:update', projectId, payload),
  },
  reels: {
    listJobs: () => ipcRenderer.invoke('reels:listJobs'),
    getJob: (jobId: string) => ipcRenderer.invoke('reels:getJob', jobId),
    probeYoutube: (jobId: string, url: string) => ipcRenderer.invoke('reels:probeYoutube', jobId, url),
    rankHighlights: (jobId: string) => ipcRenderer.invoke('reels:rankHighlights', jobId),
    approveHighlight: (jobId: string, candidateIndex: number, approver: string) =>
      ipcRenderer.invoke('reels:approveHighlight', jobId, candidateIndex, approver),
    downloadApprovedHighlight: (jobId: string) => ipcRenderer.invoke('reels:downloadApprovedHighlight', jobId),
    renderShort: (jobId: string) => ipcRenderer.invoke('reels:renderShort', jobId),
    openStudio: () => ipcRenderer.invoke('reels:openStudio'),
  },
  slides: {
    createPlan: (projectId: string, payload: SlidePlanPayload) =>
      ipcRenderer.invoke('slides:createPlan', projectId, payload),
    markAwaitingApproval: (projectId: string) => ipcRenderer.invoke('slides:markAwaitingApproval', projectId),
    approvePlan: (projectId: string, approver: string) => ipcRenderer.invoke('slides:approvePlan', projectId, approver),
    holdPlan: (projectId: string, reason: string) => ipcRenderer.invoke('slides:holdPlan', projectId, reason),
    renderProject: (projectId: string) => ipcRenderer.invoke('slides:renderProject', projectId),
  },
  files: {
    readText: (targetPath: string) => ipcRenderer.invoke('files:readText', targetPath),
    writeText: (payload: FileWritePayload) => ipcRenderer.invoke('files:writeText', payload),
    move: (payload: FileMovePayload) => ipcRenderer.invoke('files:move', payload),
  },
  agent: {
    runSkill: (payload: AgentRunPayload) => ipcRenderer.invoke('agent:runSkill', payload),
    checkInstall: () => ipcRenderer.invoke('agent:checkInstall'),
    onLog: (callback: (entry: AgentLogEntry) => void) => {
      ipcRenderer.on('agent:log', (_event, entry: AgentLogEntry) => callback(entry));
    },
    offLog: (callback: (entry: AgentLogEntry) => void) => {
      ipcRenderer.removeListener('agent:log', (_event: Electron.IpcRendererEvent, entry: AgentLogEntry) => callback(entry));
    },
  },
};

contextBridge.exposeInMainWorld('marketingOps', api);
