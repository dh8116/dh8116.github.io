export default function BackgroundFX() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      <div className="absolute inset-0 bg-grid" />
      <div className="motion-safe:animate-drift-a absolute -top-32 -left-24 h-[36rem] w-[36rem] rounded-full bg-brand-blue/45 blur-[90px]" />
      <div className="motion-safe:animate-drift-b absolute -bottom-32 -right-16 h-[38rem] w-[38rem] rounded-full bg-brand-yellow/30 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/10 blur-[120px]" />
    </div>
  );
}
