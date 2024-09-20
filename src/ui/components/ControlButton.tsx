import React from 'react';

interface IControlButtonProps {
  name: 'close' | 'minimize';
  onClick: React.MouseEventHandler<HTMLDivElement> | React.KeyboardEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}

export default function ControlButton({ name, onClick, children }: IControlButtonProps) {
  const title = name[0].toUpperCase() + name.substring(1);

  return (
    <div
      role='button'
      aria-label={name}
      className={`focus:outline-none py-2 px-4${name === 'close' ? '  hover:bg-red-500' : ' hover:bg-white/30'}`}
      onClick={onClick as React.MouseEventHandler<HTMLDivElement>}
      onKeyDown={onClick as React.KeyboardEventHandler<HTMLDivElement>}
      title={title}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
