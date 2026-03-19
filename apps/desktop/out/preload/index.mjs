import { contextBridge, ipcRenderer } from "electron";
const api = {
  getSnapshot: () => ipcRenderer.invoke("workspace:get-snapshot"),
  chooseWorkspacePath: () => ipcRenderer.invoke("workspace:choose-path"),
  readFile: (absolutePath) => ipcRenderer.invoke("workspace:read-file", absolutePath),
  saveFile: (payload) => ipcRenderer.invoke("workspace:save-file", payload),
  updateSourceApproval: (payload) => ipcRenderer.invoke("workspace:update-source-approval", payload),
  approveSlidePlan: (projectId) => ipcRenderer.invoke("workspace:approve-slide-plan", projectId),
  setProjectStage: (projectId, stage) => ipcRenderer.invoke("workspace:set-project-stage", projectId, stage),
  spawnApproved: (sourceId) => ipcRenderer.invoke("workspace:spawn-approved", sourceId),
  runValidation: () => ipcRenderer.invoke("workspace:run-validation"),
  getProviderStatus: () => ipcRenderer.invoke("runtime:get-status"),
  connectProvider: () => ipcRenderer.invoke("runtime:connect"),
  runStage: (request) => ipcRenderer.invoke("runtime:run-stage", request),
  cancelRun: (runId) => ipcRenderer.invoke("runtime:cancel-run", runId),
  applyDiff: (runId) => ipcRenderer.invoke("runtime:apply-diff", runId),
  discardRun: (runId) => ipcRenderer.invoke("runtime:discard-run", runId),
  getAppState: () => ipcRenderer.invoke("app:get-state"),
  openPath: (targetPath) => ipcRenderer.invoke("app:open-path", targetPath),
  openExternal: (url) => ipcRenderer.invoke("app:open-external", url),
  onSnapshot: (callback) => {
    const listener = (_event, snapshot) => {
      callback(snapshot);
    };
    ipcRenderer.on("workspace:snapshot", listener);
    return () => {
      ipcRenderer.removeListener("workspace:snapshot", listener);
    };
  },
  onRunUpdate: (callback) => {
    const listener = (_event, result) => {
      callback(result);
    };
    ipcRenderer.on("runtime:run-update", listener);
    return () => {
      ipcRenderer.removeListener("runtime:run-update", listener);
    };
  }
};
contextBridge.exposeInMainWorld("contentOS", api);
