import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-xl font-bold font-headline", className)}>
      <span className="text-primary">AIUB</span>
      <span className="font-light text-foreground">Connect</span>
    </Link>
  );
}
