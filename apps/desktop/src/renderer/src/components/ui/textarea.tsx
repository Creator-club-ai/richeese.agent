import * as React from 'react';

import { cn } from '@renderer/lib/utils';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[120px] w-full rounded-xl border border-chrome-200 bg-white px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-chrome-400 focus:border-accent focus:ring-4 focus:ring-accent/10',
      className,
    )}
    {...props}
  />
));

Textarea.displayName = 'Textarea';
