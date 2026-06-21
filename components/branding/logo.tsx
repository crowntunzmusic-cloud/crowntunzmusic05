import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: number;
}

export function CrowntunzLogo({ className, showText = true, size = 32 }: LogoProps) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="ct-crown-grad" x1="6" y1="8" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FBBF24" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="ct-wave-grad" x1="14" y1="28" x2="34" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FBBF24" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
        </defs>
        <path
          d="M8 16L14.5 22L24 10L33.5 22L40 16L37.5 36H10.5L8 16Z"
          fill="url(#ct-crown-grad)"
          stroke="#F59E0B"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="14.5" cy="22" r="2" fill="#FEF3C7" />
        <circle cx="24" cy="10" r="2.5" fill="#FEF3C7" />
        <circle cx="33.5" cy="22" r="2" fill="#FEF3C7" />
        <rect x="10" y="36" width="28" height="3" rx="1.5" fill="#D97706" />
        <path
          d="M15 34V32M20 34V30M25 34V28M30 34V30M35 34V32"
          stroke="url(#ct-wave-grad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="text-base font-extrabold tracking-tight text-foreground">
            Crowntunz
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-amber-400">
            Music
          </span>
        </span>
      )}
    </span>
  );
}
