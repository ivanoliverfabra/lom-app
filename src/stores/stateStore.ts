import { createStore } from 'zustand/vanilla';

import { StateChannels } from 'src/channels/stateChannels';

export type IPCStateState = {
  state: IPCState;
};

export type IPCStateActions = {
  set: (state: IPCState, id?: number) => void;
};

export type IPCStateStore = IPCStateState & IPCStateActions;

export const defaultInitState: IPCStateState = {
  state: 'loading-profiles',
};

export const createIPCStateStore = (initState: IPCStateState = defaultInitState) => {
  return createStore<IPCStateStore>()((set) => ({
    ...initState,
    set: (state, id) => {
      electron.ipcRenderer
        .invoke<boolean, [IPCState, number | undefined]>(StateChannels.SET_STATE, state, id)
        .then((result) => {
          if (result) {
            set({ state });
          }
        });
    },
  }));
};
