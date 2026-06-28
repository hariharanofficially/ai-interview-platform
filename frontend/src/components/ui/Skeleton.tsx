import { cn } from '@lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-dark-800', className)}
      {...props}
    />
  );
}

export { Skeleton };
