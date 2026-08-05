




export default function Loader({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden bg-navy/[0.06]"
    >
      <div className="h-full w-1/3 animate-loader-bar rounded-r-full bg-gradient-to-r from-gold via-gold-bright to-red" />
    </div>
  );
}
