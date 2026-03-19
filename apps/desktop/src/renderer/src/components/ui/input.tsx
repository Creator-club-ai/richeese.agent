import * as React from 'react';

import { cn } from '@renderer/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-xl border border-chrome-200 bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-chrome-400 focus:border-accent focus:ring-4 focus:ring-accent/10',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
