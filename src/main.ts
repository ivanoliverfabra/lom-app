import { app, BrowserWindow, net, protocol } from 'electron';
import path from 'node:path';

import { Client } from '@xhayper/discord-rpc';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

import { createAppWindow } from './appWindow';
import { getProfiles, initDatabase } from './database';

if (require('electron-squirrel-startup')) app.quit();

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

if (require('electron-squirrel-startup')) {
  app.quit();
}

export const db = initDatabase();
export const rpcClient = new Client({
  clientId: '1285619509151141968',
});

protocol.registerSchemesAsPrivileged([{ scheme: 'atom', privileges: { standard: true, secure: true } }]);

app.whenReady().then(async () => {
  const profiles = await getProfiles(db);
  rpcClient
    .connect()
    .then(() => {
      rpcClient.user?.setActivity?.({
        details: 'Legend of Mushroom',
        state: `Viewing ${profiles.length > 1 ? `${profiles.length} profiles` : '1 profile'}`,
        instance: false,
        buttons: [
          {
            label: 'Download',
            url: 'https://discord.gg/Q5deNkpPRP',
          },
        ],
      });
    })
    .catch(console.error);

  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.info(`Added Extension:  ${name}`))
    .catch((err) => console.info('An error occurred: ', err));

  protocol.handle('atom', (req) => {
    const pathToServe = req.url.replace('atom://', '');
    if (pathToServe.startsWith('images/avatars/')) {
      return net.fetch(path.join(app.getPath('userData'), 'images/avatars', pathToServe.split('/').pop()));
    }
  });
});

app.on('ready', () => {
  createAppWindow('profiles');
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createAppWindow('profiles').then(() => {
      rpcClient.connect().catch(console.error);
    });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
