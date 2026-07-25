export default function BackgroundFX() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid" />
      <div className="motion-safe:animate-drift-a absolute -top-40 -left-32 h-[30rem] w-[30rem] rounded-full bg-brand-blue/25 blur-[110px]" />
      <div className="motion-safe:animate-drift-b absolute top-1/3 -right-24 h-[34rem] w-[34rem] rounded-full bg-brand-yellow/15 blur-[130px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
    </div>
  );
}
