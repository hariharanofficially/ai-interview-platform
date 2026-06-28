import { HTMLAttributes } from 'react';
import { cn } from '@lib/utils';

type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?:  AlertVariant;
  title?:    string;
}

const variants: Record<AlertVariant, { container: string; icon: string }> = {
  info:    { container: 'bg-primary-500/10 border-primary-500/30 text-primary-300',  icon: 'ℹ' },
  success: { container: 'bg-success-500/10 border-success-500/30 text-success-400',  icon: '✓' },
  warning: { container: 'bg-warning-500/10 border-warning-500/30 text-warning-400',  icon: '⚠' },
  danger:  { container: 'bg-danger-500/10  border-danger-500/30  text-danger-400',   icon: '✕' },
};

export function Alert({ variant = 'info', title, children, className, ...props }: AlertProps) {
  const { container, icon } = variants[variant];

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 p-4 rounded-xl border text-sm',
        container,
        className
      )}
      {...props}
    >
      <span className="shrink-0 font-bold">{icon}</span>
      <div>
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="opacity-90">{children}</div>
      </div>
    </div>
  );
}
