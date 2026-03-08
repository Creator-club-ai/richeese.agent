import { ipcMain } from 'electron';
import { createProjectShell, listProjects, readProjectDetails, updateProjectMeta } from './helpers.js';

export const registerProjectHandlers = () => {
  ipcMain.handle('projects:list', async () => {
    return listProjects();
  });

  ipcMain.handle('projects:get', async (_event, projectId: string) => {
    return readProjectDetails(projectId);
  });

  ipcMain.handle('projects:create', async (_event, payload) => {
    return createProjectShell(payload);
  });

  ipcMain.handle('projects:updateMeta', async (_event, projectId: string, payload) => {
    return updateProjectMeta(projectId, payload);
  });
};