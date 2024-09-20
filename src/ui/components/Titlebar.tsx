import React, { useState } from 'react';

import { useRendererListener } from 'src/ui/hooks';
import { WindowState } from 'src/windowState';

interface ITitleBarProps {
  children: (props: WindowState) => React.ReactNode;
}

export default function Titlebar({ children }: ITitleBarProps) {
  const [windowState, setWindowState] = useState<WindowState>('normal');

  useRendererListener('window-state-changed', (_, windowState: WindowState) => setWindowState(windowState));

  return (
    <div className='flex justify-between bg-gray-900 h-fit pl-2 rounded-t-xl border-b border-white/25 overflow-hidden'>
      {children(windowState)}
    </div>
  );
}
