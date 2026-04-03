'use client';

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <svg
        width="40"
        height="40"
        viewBox="0 0 64 64"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2a7cff" />
            <stop offset="1" stopColor="#1362e3" />
          </linearGradient>
        </defs>
        <rect x="6" y="6" width="52" height="52" rx="14" fill="url(#g)" />
        <path
          d="M26 22 L18 32 L26 42"
          fill="none"
          stroke="#0b0b0d"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M38 22 L46 32 L38 42"
          fill="none"
          stroke="#0b0b0d"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M30.5 44 L33.5 20"
          fill="none"
          stroke="#0b0b0d"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
      {!compact && (
        <div className="leading-tight">
          <div className="text-lg font-semibold tracking-tight text-fg">memory-bot</div>
        </div>
      )}
    </div>
  );
}

