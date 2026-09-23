import {
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useSwipeBack } from "../hooks/useSwipeBack";

interface AppLayoutProps {
  centerSlot?: ReactNode;
  rightSlot?: ReactNode;
  children?: ReactNode;
}

export interface WeatherLayoutContext {
  setWeatherPhoto: Dispatch<SetStateAction<string | null>>;
}

function AppLayout({ centerSlot, rightSlot, children }: AppLayoutProps) {
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isCityPage = location.pathname.startsWith("/city/");
  const [weatherPhoto, setWeatherPhoto] = useState<string | null>(null);

  useSwipeBack(mainRef);

  return (
    <div
      className={`app-shell relative h-screen flex flex-col overflow-hidden${isCityPage ? " app-shell-weather" : ""}`}
    >
      {!isCityPage && (
        <div className="fixed inset-0 z-0 bg-gradient-to-b from-bg-primary to-bg-secondary">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,_var(--color-accent-blue-glow)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,_oklch(0.45_0.15_280_/_0.06)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,_oklch(0.6_0.15_160_/_0.04)_0%,_transparent_50%)]" />
        </div>
      )}

      {isCityPage && (
        <div
          className="weather-backdrop"
          aria-hidden="true"
          style={
            {
              "--weather-photo": `url('/weather/${weatherPhoto ?? "clouds.jpg"}')`,
            } as CSSProperties
          }
        />
      )}

      <header
        className="app-glass-bar h-16 relative z-10 shrink-0 flex items-center gap-3 sm:gap-8 px-3 sm:px-8 border-b border-border-default backdrop-blur-md bg-bg-glass"
      >
        <Link
          to="/"
          aria-label="Home"
          className="shrink-0 flex items-center hover:opacity-80 transition-opacity"
        >
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
        </Link>

        {!isLoginPage && centerSlot && (
          <div className="min-w-0 flex-1">
            {centerSlot}
          </div>
        )}

        <div className="ml-auto shrink-0 flex items-center justify-end sm:min-w-[140px] h-11 sm:h-8">
          {rightSlot}
        </div>
      </header>

      <main
        ref={mainRef}
        className="relative z-1 flex-1 flex flex-col overflow-auto"
      >
        {children ?? (
          <Outlet
            context={{ setWeatherPhoto } satisfies WeatherLayoutContext}
          />
        )}
      </main>

      <footer
        style={{ height: "56px", minHeight: "56px", maxHeight: "56px" }}
        className="app-glass-bar h-14 relative z-1 shrink-0 flex items-center justify-between px-8 border-t border-border-default text-xs text-text-muted"
      >
        <span>Live data — OpenWeather</span>
        <span>Made for everyday planning</span>
      </footer>
    </div>
  );
}

export default AppLayout;
