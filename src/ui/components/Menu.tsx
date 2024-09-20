/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useCallback, useState, type MouseEvent } from 'react';

import logo from 'assets/icons/icon.png';
import { MenuChannels } from 'src/channels/menuChannels';

export default function Menu() {
  const [isDragging, setIsDragging] = useState(false);
  const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 });
  const [windowPosition, setWindowPosition] = useState({ x: 0, y: 0 });

  const getPosition = useCallback(() => {
    return new Promise<[number, number]>((resolve, reject) => {
      electron.ipcRenderer
        .invoke(MenuChannels.WINDOW_GET_POSITION)
        .then((pos: [number, number]) => {
          setWindowPosition({ x: pos[0], y: pos[1] });
          resolve(pos);
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }, []);

  const dragWindow = useCallback(
    (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
      if (!isDragging) return;

      const deltaX = e.screenX - initialMousePosition.x;
      const deltaY = e.screenY - initialMousePosition.y;

      const newX = windowPosition.x + deltaX;
      const newY = windowPosition.y + deltaY;

      electron.ipcRenderer.invoke(MenuChannels.WINDOW_DRAG, [newX, newY]);
    },
    [isDragging, initialMousePosition, windowPosition],
  );

  const startDragging = useCallback(
    (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
      // Get initial mouse and window positions
      getPosition().then(() => {
        setInitialMousePosition({ x: e.screenX, y: e.screenY });
        setIsDragging(true);
      });
    },
    [getPosition],
  );

  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      className={`flex items-center gap-x-2 select-none w-full flex-grow${isDragging ? ' cursor-grabbing' : ' cursor-grab'}`}
      onMouseDown={startDragging}
      onMouseMove={dragWindow}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
    >
      <img src={logo} alt='logo' className='h-6 rounded-md' />
      <h2 className='text-white text-sm'>Legend of Mushroom</h2>
    </div>
  );
}
