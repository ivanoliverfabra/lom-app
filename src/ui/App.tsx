import React from 'react';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';

import { MenuChannels } from 'src/channels/menuChannels';
import { useRendererListener, useThemeListener } from 'src/ui/hooks';
import Titlebar from 'ui/components/Titlebar';
import WindowControls from 'ui/components/WindowControls';
import Home from 'ui/screens/Home';

import Layout from './components/Layout';
import Menu from './components/Menu';

const onMenuEvent = (_: Electron.IpcRendererEvent, channel: string, ...args: any[]) => {
  electron.ipcRenderer.invoke(channel, args);
};

export default function App() {
  useRendererListener(MenuChannels.MENU_EVENT, onMenuEvent);

  useThemeListener();

  return (
    <Router>
      <Titlebar>
        {(windowState) => (
          <>
            {__WIN32__ && (
              <>
                <Menu />
                <WindowControls windowState={windowState} />
              </>
            )}
          </>
        )}
      </Titlebar>
      <Layout>
        <Routes>
          <Route path='/' Component={Home} />
        </Routes>
      </Layout>
    </Router>
  );
}
