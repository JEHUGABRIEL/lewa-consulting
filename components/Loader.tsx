import Mark from "./Mark";

export default function Loader({ label }: { label: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-navy" role="status" aria-label={label}>
      {/* Accent bar top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gold-bright via-red to-navy" />

      {/* Animated logo */}
      <div className="relative animate-float">
        <div className="absolute inset-0 animate-ping-slow rounded-full bg-gold-bright/10" />
        {/* Logo sur fond navy : cadre blanc arrondi */}
        <div className="relative rounded-2xl bg-white p-3 shadow-2xl">
          <Mark className="h-14 w-auto" />
        </div>
      </div>

      {/* Text */}
      <div className="mt-6 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-bright/80">
          Cabinet
        </p>
        <p className="mt-1 font-display text-base font-semibold text-paper/90">
          COSI Lewa-Consulting Group
        </p>
      </div>

      {/* Dots */}
      <div className="mt-8 flex items-center gap-1.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-gold-bright" style={{ animationDelay: "0ms" }} />
        <span className="h-2 w-2 animate-pulse rounded-full bg-gold-bright" style={{ animationDelay: "300ms" }} />
        <span className="h-2 w-2 animate-pulse rounded-full bg-gold-bright" style={{ animationDelay: "600ms" }} />
      </div>

      {/* Accent bar bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-navy via-red to-gold-bright" />
    </div>
  );
}
