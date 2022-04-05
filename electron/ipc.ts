import { contextBridge } from 'electron';

interface APIInstance {
  key: string;
  channel: string;
  handler: any;
}

type _Promise<T> = T extends Promise<any> ? T : Promise<T>;

export type ExtractApi<T> = {
  [X in keyof T]: T[X] extends (...args: any) => any ? (...args: Parameters<T[X]>) => _Promise<ReturnType<T[X]>> : T[X];
};

declare global {
  interface Function {
    _ipc?: boolean;
  }
}

// https://github.com/electron-userland/spectron/issues/693#issuecomment-888793600
function exposeInMainWorld(apiKey: string, api: any) {
  if (process.env.NODE_ENV === 'development') {
    /**
     * Recursively Object.freeze() on objects and functions
     * @see https://github.com/substack/deep-freeze
     * @param o Object on which to lock the attributes
     */
    // eslint-disable-next-line no-inner-declarations
    function deepFreeze<T extends Record<string, any>>(o: T): Readonly<T> {
      Object.freeze(o);

      Object.getOwnPropertyNames(o).forEach(prop => {
        if (
          Object.prototype.hasOwnProperty.call(o, prop) &&
          o[prop] !== null &&
          (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
          !Object.isFrozen(o[prop])
        ) {
          deepFreeze(o[prop]);
        }
      });

      return o;
    }

    deepFreeze(api);

    // @ts-expect-error https://github.com/electron-userland/spectron/issues/693#issuecomment-747872160
    window[apiKey] = api;
  } else {
    /**
     * The "Main World" is the JavaScript context that your main renderer code runs in.
     * By default, the page you load in your renderer executes code in this world.
     *
     * @see https://www.electronjs.org/docs/api/context-bridge
     */
    contextBridge.exposeInMainWorld(apiKey, api);
  }
}

export function isRaw<T>(obj: T): T {
  return Object.defineProperty(obj, '_ipc', { value: false, writable: false });
}

export function createApi<T extends Record<string, APIInstance['handler']>>(
  parent: string,
  obj: T,
  notIpc: (keyof T)[] = []
) {
  const results: APIInstance[] = [];

  for (const key in obj) {
    const channel = `${parent}:${key}`;
    const handler = obj[key];

    if (typeof handler === 'function' && notIpc.includes(key) && typeof handler._ipc === 'undefined') {
      isRaw(handler);
    }

    results.push({
      key,
      channel,
      handler
    });
  }

  const handle = (ipcMain: Electron.IpcMain) => {
    for (const { channel, handler } of results) {
      if (typeof handler === 'function') {
        ipcMain.handle(channel, (_event, ...args) => handler(...args));
      }
    }
  };

  const expose = (ipcRenderer: Electron.IpcRenderer) => {
    const apis = results.reduce((apis, { key, channel, handler }) => {
      return {
        ...apis,
        [key as keyof T]:
          typeof handler === 'function'
            ? // eslint-disable-next-line @typescript-eslint/ban-types
            (handler as Function)._ipc === false
              ? handler
              : (...args: any) => ipcRenderer.invoke(channel, ...args)
            : handler
      };
    }, {} as Record<keyof T, Promise<any>>);
    return exposeInMainWorld(parent, apis);
  };

  return { handle, expose };
}
