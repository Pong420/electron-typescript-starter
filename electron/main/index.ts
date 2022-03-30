import path from 'path';
import { app, BrowserWindow, WebPreferences } from 'electron';
import { getWindowPosition, saveWindowPosition } from './position';
import { registerDarkMode } from './darkMode';

const development = process.env.NODE_ENV === 'development';

async function createWindow() {
  const webPreferences: WebPreferences = development ? { nodeIntegration: true, contextIsolation: false } : {};

  const pos = await getWindowPosition({});

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    ...pos,
    width: 800,
    height: 600,
    // contextIsolation: true,
    webPreferences: {
      ...webPreferences,
      contextIsolation: !development,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (development) {
    const port = process.env.DEV_SERVER_PORT ? Number(process.env.DEV_SERVER_PORT) : 8080;
    mainWindow.loadURL(`http://localhost:${port}`);
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }

  registerDarkMode();

  // // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.on('moved', () => {
    saveWindowPosition(mainWindow.getBounds());
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
