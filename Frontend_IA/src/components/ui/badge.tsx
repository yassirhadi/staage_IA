import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive/15 text-[hsl(350_45%_58%)] border-[hsl(350_45%_38%)]/20',
        outline: 'text-foreground border-border',
        success: 'border-transparent bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
        warning: 'border-transparent bg-amber-500/15 text-amber-400 border-amber-500/20',
        critical: 'border-transparent bg-[hsl(350_45%_38%)]/20 text-[hsl(350_45%_70%)] border-[hsl(350_45%_38%)]/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
