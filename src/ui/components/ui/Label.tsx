import React from 'react';

import { cn } from 'src/lib/utils';

type LabelProps = React.InputHTMLAttributes<HTMLLabelElement> & {
  htmlFor: string;
};

export default function Label({ className, ...props }: LabelProps) {
  return <label {...props} htmlFor={props.htmlFor} className={cn('text-sm text-gray-50', className)} />;
}
