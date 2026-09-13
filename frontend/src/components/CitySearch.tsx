import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { searchCities, type CityResult } from "../api/weather";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function parseQuery(raw: string): { city: string; country?: string } {
  const trimmed = raw.trim();
  // Support "Paris FR" or "Paris, FR" format
  const match = trimmed.match(/^(.+?)[,\s]+([A-Za-z]{2,3})$/);
  if (match) {
    return { city: match[1].trim(), country: match[2].trim().toUpperCase() };
  }
  return { city: trimmed };
}

function cityLabel(city: CityResult): string {
  const parts = [city.name];
  if (city.state) parts.push(city.state);
  parts.push(city.country);
  return parts.join(", ");
}

function cityNavKey(city: CityResult): string {
  // Prefer city name + country for URL navigation
  const parts = [city.name];
  if (city.country) parts.push(city.country);
  return parts.join(",");
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function SearchTooltip() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-5 h-5 rounded-full border border-border-light text-text-muted hover:text-text-secondary hover:border-border-light/70 text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer"
        aria-label="Search tip"
      >
        ?
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-50 w-64 p-3 rounded-xl bg-bg-card border border-border-light backdrop-blur-xl shadow-2xl shadow-black/40 text-xs text-text-secondary leading-relaxed">
          <p className="font-medium text-text-primary mb-1">Can't find your city?</p>
          <p>
            Try adding the country code after the name, for example:
          </p>
          <p className="mt-1 font-mono text-accent-blue">Paris FR</p>
          <p className="font-mono text-accent-blue">Springfield US</p>
        </div>
      )}
    </div>
  );
}

// ─── Result item ─────────────────────────────────────────────────────────────

interface ResultItemProps {
  city: CityResult;
  onSelect: (city: CityResult) => void;
}

function ResultItem({ city, onSelect }: ResultItemProps) {
  const badge = city.isFavorite ? "⭐" : city.isInSearchHistory ? "🕘" : null;

  return (
    <button
      type="button"
      onClick={() => onSelect(city)}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-bg-glass transition-colors group cursor-pointer"
    >
      {badge ? (
        <span className="text-sm shrink-0">{badge}</span>
      ) : (
        <svg
          className="w-3.5 h-3.5 text-text-muted shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      )}
      <span className="text-sm text-text-primary truncate">{cityLabel(city)}</span>
      <span className="ml-auto text-xs text-text-muted shrink-0">{city.country}</span>
    </button>
  );
}

// ─── CitySearch ───────────────────────────────────────────────────────────────

export function CitySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const { city, country } = parseQuery(debouncedQuery);
    let cancelled = false;

    setIsLoading(true);
    searchCities(city, country)
      .then((data) => {
        if (!cancelled) {
          setResults(data.cities);
          setIsOpen(true);
        }
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleSelect = useCallback((city: CityResult) => {
    setQuery("");
    setIsOpen(false);
    navigate(`/city/${encodeURIComponent(cityNavKey(city))}`);
  }, [navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
    }
    if (e.key === "Enter" && results.length > 0) {
      handleSelect(results[0]);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm mx-auto">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          {/* Search icon */}
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          <input
            id="city-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search city…"
            autoComplete="off"
            className="w-full pl-8 pr-3 py-1.5 bg-bg-glass border border-border-default focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 rounded-lg text-xs text-text-primary placeholder:text-text-muted outline-none transition-all"
          />

          {/* Spinner */}
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border border-text-muted border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        <SearchTooltip />
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 z-40 rounded-xl border border-border-light bg-bg-card backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
          {results.map((city, i) => (
            <ResultItem key={`${city.name}-${city.lat}-${city.lon}-${i}`} city={city} onSelect={handleSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
