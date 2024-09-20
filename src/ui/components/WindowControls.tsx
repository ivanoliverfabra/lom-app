import React, { useCallback } from 'react';

import { MenuChannels } from 'src/channels/menuChannels';
import { WindowState } from 'src/windowState';
import ControlButton from 'ui/components/ControlButton';

interface IWindowControlsProps {
  readonly windowState: WindowState;
}

export default function WindowControls({ windowState }: IWindowControlsProps) {
  const executeWindowCommand = useCallback((command: string) => {
    electron.ipcRenderer.invoke(command, windowState);
  }, []);

  return (
    <section className='flex'>
      <ControlButton name='minimize' onClick={() => executeWindowCommand(MenuChannels.WINDOW_MINIMIZE)}>
        <svg width='14' height='14' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path d='M3 12h18' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
        </svg>
      </ControlButton>
      <ControlButton name='close' onClick={() => executeWindowCommand(MenuChannels.WINDOW_CLOSE)}>
        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M6 18L18 6M6 6l12 12'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </ControlButton>
    </section>
  );
}
