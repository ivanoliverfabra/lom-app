import { BrowserWindow, ipcMain } from 'electron';

import { MenuChannels } from 'src/channels/menuChannels';

export function registerMenuIPC(window: BrowserWindow) {
  ipcMain.handle(MenuChannels.WINDOW_MINIMIZE, () => window.minimize());
  ipcMain.handle(MenuChannels.WINDOW_MAXIMIZE, () => {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  });
  ipcMain.handle(MenuChannels.WINDOW_CLOSE, () => window.close());
  ipcMain.handle(MenuChannels.WINDOW_DRAG, (_, pos: [number, number]) => {
    window.setPosition(pos[0], pos[1]);
  });
  ipcMain.handle(MenuChannels.WINDOW_GET_POSITION, () => window.getPosition() as [number, number]);
}
