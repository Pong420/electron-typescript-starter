import { nativeTheme } from 'electron';
import { createApi, ExtractApi } from '../ipc';

type DarkModeAPI = ExtractApi<typeof apis>;

declare global {
  const darkMode: DarkModeAPI;
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

const apis = { toggle, system };

export const darkMode = createApi('darkMode', apis);
