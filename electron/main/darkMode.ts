import { ipcMain, nativeTheme } from 'electron';
import { DarkMode } from '../constants';

const darkModeHandlers = {
  [DarkMode.Toggle]: () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light';
    } else {
      nativeTheme.themeSource = 'dark';
    }
    return nativeTheme.shouldUseDarkColors;
  },
  [DarkMode.System]: () => {
    nativeTheme.themeSource = 'system';
  }
};

const entries = Object.entries(darkModeHandlers);

export function registerDarkMode() {
  for (const [key, handler] of entries) {
    ipcMain.handle(key, handler);
  }
}
