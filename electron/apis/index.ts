import { darkMode } from './darkMode';

const apis = [darkMode];

export const registerIpcHandlers = (ipcMain: Electron.IpcMain) => {
  for (const api of apis) {
    api.handle(ipcMain);
  }
};

export const exposeInMainWorld = (ipcRenderer: Electron.IpcRenderer) => {
  for (const api of apis) {
    api.expose(ipcRenderer);
  }
};
