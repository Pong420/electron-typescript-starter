import { ipcRenderer } from 'electron';
import { register } from './api';
import { DarkMode } from '../constants';

interface DarkModeFn {
  toggle: () => Promise<boolean>;
  system: () => Promise<void>;
}

declare global {
  const darkMode: DarkModeFn;
}

const apis: Record<keyof DarkModeFn, () => Promise<any>> = {
  toggle: () => ipcRenderer.invoke(DarkMode.Toggle),
  system: () => ipcRenderer.invoke(DarkMode.System)
};

register('darkMode', apis);
