import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@renderer/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        neutral: 'border-chrome-200 bg-chrome-50 text-chrome-700',
        accent: 'border-blue-200 bg-blue-50 text-blue-700',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        warning: 'border-amber-200 bg-amber-50 text-amber-700',
        danger: 'border-red-200 bg-red-50 text-red-700',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps): React.JSX.Element {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
