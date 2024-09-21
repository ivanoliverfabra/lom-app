import React from 'react';

import { DialogStoreProvider } from 'src/providers/dialogStoreProvider';
import { IPCStoreProvider } from 'src/providers/ipcStoreProvider';
import { ProfileStoreProvider } from 'src/providers/profileStoreProvider';

import Dialogs from './Dialogs';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className='flex flex-col bg-gray-900 text-white h-[calc(100vh-2.5rem)] w-screen rounded-b-2xl overflow-hidden p-2'>
        {children}
      </div>

      <Dialogs />
    </Providers>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <IPCStoreProvider>
      <DialogStoreProvider>
        <ProfileStoreProvider>{children}</ProfileStoreProvider>
      </DialogStoreProvider>
    </IPCStoreProvider>
  );
}
