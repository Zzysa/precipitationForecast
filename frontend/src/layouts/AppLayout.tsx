import type { ReactNode } from "react";

interface AppLayoutProps {
  centerSlot?: ReactNode;
  children: ReactNode;
}

function AppLayout({ centerSlot, children }: AppLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-bg-primary to-bg-secondary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,_var(--color-accent-blue-glow)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,_oklch(0.45_0.15_280_/_0.06)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,_oklch(0.6_0.15_160_/_0.04)_0%,_transparent_50%)]" />
      </div>

      <header className="relative z-10 flex items-center gap-8 px-8 py-4 border-b border-border-default backdrop-blur-md bg-bg-glass">
        <div className="flex items-center">
          <svg
            className="w-6 h-6 text-accent-blue"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        </div>

        <div className="flex-1">{centerSlot}</div>
      </header>

      <main className="relative z-1 flex-1 p-8">{children}</main>

      <footer className="relative z-1 flex items-center justify-between px-8 py-4 border-t border-border-default text-xs text-text-muted">
        <span>Live data — OpenWeather</span>
        <span>Made for everyday planning</span>
      </footer>
    </div>
  );
}

export default AppLayout;
