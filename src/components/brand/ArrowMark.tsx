/** The Hood mark — a broadhead arrow inside a drawn ring. */
export function ArrowMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <circle
        cx="16"
        cy="16"
        r="14.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeDasharray="68 23"
        strokeLinecap="round"
        transform="rotate(-50 16 16)"
      />
      <path d="M23.5 8.5 L14.8 17.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M23.5 8.5 L17.4 10.1 L21.9 14.6 Z" fill="currentColor" />
      <path
        d="M13.4 18.6 L9.2 22.8 M11.2 16.4 L8.4 19.2 M15.6 20.8 L12.8 23.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
