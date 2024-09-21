import React, { type ReactNode, createContext, useContext, useRef } from 'react';
import { useStore } from 'zustand';

import { type IPCStateStore, createIPCStateStore } from 'src/stores/stateStore';

export type IPCStoreApi = ReturnType<typeof createIPCStateStore>;

export const ipcStoreContext = createContext<IPCStoreApi | undefined>(undefined);

export interface IPCStoreProviderProps {
  children: ReactNode;
}

export const IPCStoreProvider = ({ children }: IPCStoreProviderProps) => {
  const storeRef = useRef<IPCStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createIPCStateStore();
  }

  return <ipcStoreContext.Provider value={storeRef.current}>{children}</ipcStoreContext.Provider>;
};

export const useIPCStore = <T,>(selector: (store: IPCStateStore) => T): T => {
  const profileStoreContext = useContext(ipcStoreContext);

  if (!profileStoreContext) {
    throw new Error(`useProfileStore must be used within ProfileStoreProvider`);
  }

  return useStore(profileStoreContext, selector);
};
