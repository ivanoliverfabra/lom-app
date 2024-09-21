import { BrowserWindow, ipcMain } from 'electron';

import { StateChannels } from 'src/channels/stateChannels';

type OnSetState = (state: IPCState, id?: number) => void;
export function registerStateIPC(_window: BrowserWindow, callback: OnSetState): void {
  ipcMain.handle(StateChannels.SET_STATE, async (_, state: IPCState, id?: number) => {
    return new Promise((resolve) => {
      callback(state, id);
      resolve(true);
    });
  });
}
