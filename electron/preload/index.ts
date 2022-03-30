import { ipcRenderer } from 'electron';
import { exposeInMainWorld } from '../apis';

exposeInMainWorld(ipcRenderer);
