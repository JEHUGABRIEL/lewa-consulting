export default function Mark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <polygon points="24,3 42,13.5 42,34.5 24,45 6,34.5 6,13.5" fill="none" stroke="var(--navy)" strokeWidth="1.6" />
      <polygon points="24,10 35.5,16.7 35.5,30.3 24,37 12.5,30.3 12.5,16.7" fill="var(--navy)" />
      <path d="M24 10 L35.5 16.7 L24 23.5 L12.5 16.7 Z" fill="var(--gold-bright)" />
      <path d="M24 23.5 L35.5 16.7 L35.5 30.3 Z" fill="var(--red)" />
    </svg>
  );
}
