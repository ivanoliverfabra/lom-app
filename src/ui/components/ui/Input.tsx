import React from 'react';

import { cn } from 'src/lib/utils';

import Label from './Label';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input({ className: cN, label, ...props }: InputProps) {
  const className = cn(
    'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900',
    cN,
  );

  if (label) {
    return (
      <div>
        <Label htmlFor={props.id}>{label}</Label>
        <input {...props} className={className} />
      </div>
    );
  }

  return <input {...props} className={className} />;
}
