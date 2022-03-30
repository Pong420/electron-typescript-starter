import { nativeTheme } from 'electron';
import { createApi } from '../ipc';

interface DarkModeFn {
  toggle: () => Promise<boolean>;
  system: () => Promise<void>;
}

declare global {
  export interface Window {
    darkMode: DarkModeFn;
  }
}

const toggle = () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = 'light';
  } else {
    nativeTheme.themeSource = 'dark';
  }
  return nativeTheme.shouldUseDarkColors;
};

const system = () => {
  nativeTheme.themeSource = 'system';
};

export const darkMode = createApi('darkMode', { toggle, system });
