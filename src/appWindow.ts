import { app, BrowserWindow, session } from 'electron';
import path from 'path';

import windowStateKeeper from 'electron-window-state';

import { registerWindowStateChangedEvents } from 'src/windowState';

import { getProfile } from './database';
import { registerMenuIPC } from './ipc/menuIPC';
import { getPath, registerProfileIPC } from './ipc/profileIPC';
import { db } from './main';

type AppWindowType = 'profiles' | 'new-instance' | 'guest-instance';
type AppWindowSettings = Electron.BrowserWindowConstructorOptions & {
  url?: string;
};

const WindowSettings: Record<AppWindowType, AppWindowSettings> = {
  'new-instance': {
    width: 521,
    height: 927,
    title: 'Legend of Mushroom - Client',
    url: 'https://lom.joynetgame.com/',
    resizable: false,
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  },
  'guest-instance': {
    width: 521,
    height: 927,
    title: 'Legend of Mushroom - Client',
    url: 'https://lom.joynetgame.com/',
    resizable: false,
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  },
  profiles: {
    width: 800,
    height: 600,
    title: 'Legend of Mushroom - Profiles',
    transparent: true,
    autoHideMenuBar: true,
    resizable: false,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  },
};

let appWindow: BrowserWindow;
const instances: Record<number | string, BrowserWindow> = {};

/**
 * Create Application Window
 * @returns { BrowserWindow } Application Window Instance
 */
export async function createAppWindow<T extends AppWindowType>(
  type: T,
  providedId?: T extends 'new-instance' ? number : never,
): Promise<BrowserWindow> {
  const id: number | 'guest' | null =
    type === 'new-instance' ? (providedId as number) : type === 'guest-instance' ? ('guest' as const) : null;

  if (type === 'new-instance' && !id) {
    throw new Error('New Instance Window requires an ID');
  }

  if (type === 'new-instance' && instances[id]) {
    instances[id].show();
    return instances[id];
  }

  let profileSession: Electron.Session = session.defaultSession;
  let profile: Profile | null = null;
  if (type === 'new-instance' || type === 'guest-instance') {
    const partitionName = `persist:${id}`;
    profileSession = session.fromPartition(partitionName, { cache: true });
    if (typeof id === 'number') profile = await getProfile(db, id);
  }

  if (!profile && type === 'new-instance') {
    throw new Error('Profile not found');
  }

  const { minWidth, minHeight, url: windowUrl, ...settings } = WindowSettings[type];

  const savedWindowState = windowStateKeeper({
    defaultWidth: minWidth,
    defaultHeight: minHeight,
    maximize: false,
  });

  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    ...savedWindowState,
    minWidth: minWidth,
    minHeight: minHeight,
    ...settings,
    webPreferences: {
      ...settings.webPreferences,
      session: profileSession,
    },
    icon: 'assets/icons/icon.png',
  };

  if (process.platform === 'darwin') {
    windowOptions.titleBarStyle = 'hidden';
  }

  // Create new window instance
  const localAppWindow = new BrowserWindow(windowOptions);

  if (windowUrl) {
    localAppWindow.loadURL(windowUrl).then(() => {
      if (profile) {
        localAppWindow.setTitle(`${localAppWindow.getTitle()} - ${profile.name}`);
        if (profile.avatar) localAppWindow.setIcon(getPath(profile.avatar.replace('atom://', '')));
      } else localAppWindow.setTitle(`${localAppWindow.getTitle()} - Guest`);
    });

    instances[id] = localAppWindow;
  } else {
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      localAppWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      localAppWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    appWindow = localAppWindow;
  }

  // Show window when is ready to
  localAppWindow.on('ready-to-show', () => {
    localAppWindow.show();
  });

  // Register Inter Process Communication for main process
  if (type === 'profiles') {
    registerMainIPC();
  }

  savedWindowState.manage(localAppWindow);

  // Close all windows when main window is closed
  localAppWindow.on('close', () => {
    if (type === 'new-instance') {
      delete instances[id];
      return;
    }

    if (type === 'guest-instance') {
      delete instances['guest'];

      session.fromPartition(`persist:guest`).clearStorageData();

      return;
    }

    appWindow = null;
    app.quit();
  });

  return localAppWindow;
}

/**
 * Register Inter Process Communication
 */
function registerMainIPC() {
  /**
   * Here you can assign IPC related codes for the application window
   * to Communicate asynchronously from the main process to renderer processes.
   */
  registerWindowStateChangedEvents(appWindow);
  registerMenuIPC(appWindow);
  registerProfileIPC(appWindow);
}
