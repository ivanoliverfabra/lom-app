import { app, BrowserWindow, session } from 'electron';
import path from 'path';

import windowStateKeeper from 'electron-window-state';

import { registerWindowStateChangedEvents } from 'src/windowState';

import { getProfile, getProfiles } from './database';
import { registerMenuIPC } from './ipc/menuIPC';
import { getPath, registerProfileIPC } from './ipc/profileIPC';
import { registerStateIPC } from './ipc/stateIPC';
import { db, rpcClient } from './main';

type AppWindowType = 'profiles' | 'new-instance' | 'guest-instance';
type AppWindowSettings = Electron.BrowserWindowConstructorOptions & {
  url?: string;
};

const WindowSettings: Record<AppWindowType, AppWindowSettings> = {
  'new-instance': {
    minWidth: 300,
    minHeight: 500,
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
    minWidth: 300,
    minHeight: 500,
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
    minWidth: 600,
    minHeight: 400,
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

const instances: Record<number | 'guest' | 'profile-manager', Instance> = {
  'profile-manager': {
    window: null,
    profile: null,
    user: null,
  },
  guest: {
    window: null,
    profile: null,
    user: null,
  },
};

// Function to set up profile session
async function setupProfileSession(id: number | 'guest' | 'profile-manager', type: AppWindowType) {
  let profileSession: Electron.Session = session.defaultSession;
  let profile: Profile | null = null;

  if (type === 'new-instance' || type === 'guest-instance') {
    const partitionName = `persist:${id}`;
    profileSession = session.fromPartition(partitionName, { cache: true });
    if (typeof id === 'number') {
      profile = await getProfile(db, id);
    }
  }

  return { profileSession, profile };
}

// Function to configure window options
function configureWindowOptions(
  settings: AppWindowSettings,
  profileSession: Electron.Session,
  minWidth: number,
  minHeight: number,
): Electron.BrowserWindowConstructorOptions {
  const savedWindowState = windowStateKeeper({
    defaultWidth: minWidth,
    defaultHeight: minHeight,
    maximize: false,
  });

  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    ...savedWindowState,
    minWidth,
    minHeight,
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

  return windowOptions;
}

// Function to load window content
async function loadWindowContent(window: BrowserWindow, windowUrl?: string, profile?: Profile) {
  if (windowUrl) {
    await window.loadURL(windowUrl);
    if (profile) {
      window.setTitle(`${window.getTitle()} - ${profile.name}`);
      if (profile.avatar) window.setIcon(getPath(profile.avatar.replace('atom://', '')));
    } else {
      window.setTitle(`${window.getTitle()} - Guest`);
    }
  } else {
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      window.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }
  }

  window.on('ready-to-show', () => {
    window.show();
  });
}

export async function createAppWindow<T extends AppWindowType>(
  type: T,
  providedId?: T extends 'new-instance' ? number : never,
): Promise<Instance> {
  const id: number | 'guest' | 'profile-manager' | null =
    type === 'new-instance' ? providedId : type === 'guest-instance' ? 'guest' : 'profile-manager';

  if (!id) throw new Error('Invalid Window Type');
  if (type === 'new-instance' && !id) throw new Error('New Instance Window requires an ID');
  if (type === 'new-instance' && instances[id]) {
    instances[id]?.window?.show();
    return instances[id];
  }

  instances[id] = instances[id] || { window: null, profile: null, user: null };

  const { profileSession, profile } = await setupProfileSession(id, type);
  if (!profile && type === 'new-instance') throw new Error('Profile not found');
  instances[id].profile = profile;

  profileSession.webRequest.onBeforeSendHeaders(
    {
      urls: ['*://*/datacf/api/push/*'],
    },
    (details, callback) => {
      const url = new URL(details.url);
      const data = url.searchParams.get('data');

      if (data) {
        try {
          const parsedData = JSON.parse(data) as DataCFRequest;
          console.info('DataCF Request:', parsedData.eventname);
          if (parsedData.eventname === 'Enter_Game') {
            instances[id].user = parsedData;
            updateActivity({ instances, currentInstanceKey: id });
          }
        } catch (error) {
          console.error(error);
        }
      }

      callback(details);
    },
  );

  const { minWidth, minHeight, url: windowUrl, ...settings } = WindowSettings[type];
  const windowOptions = configureWindowOptions(settings, profileSession, minWidth, minHeight);

  const localAppWindow = new BrowserWindow(windowOptions);
  instances[id].window = localAppWindow;

  await loadWindowContent(localAppWindow, windowUrl, profile);

  if (type === 'profiles') {
    registerMainIPC(localAppWindow);
  }

  localAppWindow.on('close', () => handleWindowClose(type, id));

  localAppWindow.on('focus', () => {
    updateActivity({ instances, currentInstanceKey: id });
  });

  updateActivity({ instances, currentInstanceKey: id });
  return instances[id];
}

// Handle window close events
function handleWindowClose(type: AppWindowType, id: number | 'guest' | 'profile-manager') {
  if (type === 'new-instance') {
    delete instances[id];
    return;
  }

  if (type === 'guest-instance') {
    delete instances['guest'];
    session.fromPartition(`persist:guest`).clearStorageData();
    return;
  }

  instances[id].window = null;
  app.quit();
}

function registerMainIPC(window: BrowserWindow): void {
  registerWindowStateChangedEvents(window);
  registerMenuIPC(window);
  registerProfileIPC(window);
  registerStateIPC(window, (action, id) => updateActivityFromIPC(action, id));
}

type RPCManagerUpdateActivityProps = {
  currentInstanceKey: number | 'guest' | 'profile-manager' | null;
  instances: Record<number | string, Instance>;
};

async function updateActivityFromIPC(action: IPCState, id?: number) {
  const discordButton = {
    label: 'Join Discord',
    url: 'https://discord.gg/Q5deNkpPRP',
  };

  if (action === 'loading-profiles') {
    await rpcClient.user?.setActivity?.({
      details: 'Legend of Mushroom',
      state: 'Loading your profiles...',
      instance: false,
      buttons: [discordButton],
    });
  } else if (action === 'selecting-profile') {
    await rpcClient.user?.setActivity?.({
      details: 'Legend of Mushroom',
      state: 'Selecting a profile...',
      instance: false,
      buttons: [discordButton],
    });
  } else if (action === 'creating-profile') {
    await rpcClient.user?.setActivity?.({
      details: 'Legend of Mushroom',
      state: 'Creating a new profile...',
      instance: false,
      buttons: [discordButton],
    });
  } else {
    const profiles = await getProfiles(db);
    const profile = profiles.find((p) => p.id === id);

    if (!profile) {
      await rpcClient.user?.setActivity?.({
        details: 'Legend of Mushroom',
        state: 'No profiles available',
        instance: false,
        buttons: [discordButton],
      });
      return;
    }

    if (action === 'editing-profile') {
      await rpcClient.user?.setActivity?.({
        details: 'Profile Manager',
        state: `Editing profile: ${profile.name}`,
        instance: false,
        buttons: [discordButton],
      });
    } else if (action === 'deleting-profile') {
      await rpcClient.user?.setActivity?.({
        details: 'Profile Manager',
        state: `Deleting profile: ${profile.name}`,
        instance: false,
        buttons: [discordButton],
      });
    } else {
      await rpcClient.user?.setActivity?.({
        details: `Active on ${profile.name}`,
        state: `Managing ${profiles.length > 1 ? `${profiles.length} profiles` : '1 profile'}`,
        instance: false,
        buttons: [discordButton],
      });
    }
  }

  return;
}

async function updateActivity({ currentInstanceKey, instances }: RPCManagerUpdateActivityProps): Promise<void> {
  const currentInstance = instances[currentInstanceKey];

  try {
    const profiles = await getProfiles(db);

    // If no profile is selected
    if (!currentInstance?.profile) {
      rpcClient.user?.setActivity?.({
        details: 'Legend of Mushroom',
        state: `Viewing ${profiles.length > 1 ? `${profiles.length} profiles` : '1 profile'}`,
        instance: false,
        buttons: [
          {
            label: 'Discord',
            url: 'https://discord.gg/Q5deNkpPRP',
          },
        ],
      });
      return;
    }

    // If profile is selected but no user is present
    if (!currentInstance?.user) {
      rpcClient.user?.setActivity?.({
        details: `Loading profile for ${currentInstance.profile.name}`,
        state: `Idle with ${Math.max(0, Object.keys(instances).length - 2) > 1 ? `${Math.max(0, Object.keys(instances).length - 2)} other instances` : '1 other instance'}`,
        instance: true,
        buttons: [
          {
            label: 'Discord',
            url: 'https://discord.gg/Q5deNkpPRP',
          },
        ],
      });
      return;
    }

    // If both profile and user are present
    await rpcClient.user?.setActivity?.({
      details: `Playing on ${currentInstance.profile.name}`,
      state: currentInstance?.user
        ? `On server ${currentInstance.user.servername} as ${currentInstance.user.rolename} (${currentInstance.user.rolelevel})`
        : `Idle with ${Math.max(0, Object.keys(instances).length - 1)} other instance${Object.keys(instances).length - 1 !== 1 ? 's' : ''}`,
      instance: true,
      buttons: [
        {
          label: 'Discord',
          url: 'https://discord.gg/Q5deNkpPRP',
        },
      ],
    });
  } catch (error) {
    console.error('Error updating activity:', error);
  }
}
