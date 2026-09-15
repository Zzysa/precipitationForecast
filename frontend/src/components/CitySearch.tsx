import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CountryFlag } from "./CountryFlag";
import {
  searchCities,
  addFavorite,
  removeFavorite,
  getFavorites,
  deleteSearchHistoryEntry,
  getWeather,
  type CityResult,
} from "../api/weather";

const HOME_LISTS_CHANGED = "home-lists-changed";

function notifyHomeListsChanged() {
  window.dispatchEvent(new Event(HOME_LISTS_CHANGED));
}

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
  const match = trimmed.match(/^(.+?)[,\s]+([A-Za-z]{2,3})$/);
  if (match) {
    return { city: match[1].trim(), country: match[2].trim().toUpperCase() };
  }
  return { city: trimmed };
}

function deduplicateCities(cities: CityResult[]): CityResult[] {
  const seen = new Set<string>();
  const out: CityResult[] = [];
  for (const c of cities) {
    const normName = c.name
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim()
      .toLowerCase();
    const normCountry = c.country.trim().toLowerCase();
    const normState = (c.state || "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim()
      .toLowerCase();
    const key = `${normName}|${normCountry}|${normState}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(c);
    }
  }
  return out;
}

function SearchTooltip() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="w-8 h-8 rounded-lg border border-border-light bg-bg-card text-text-muted hover:text-accent-blue hover:border-accent-blue/50 hover:bg-bg-card-hover text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
        aria-label="Search hint"
      >
        ?
      </button>

      {open && (
        <div
          role="tooltip"
          className="absolute right-0 top-10 z-50 w-64 p-3.5 rounded-xl bg-[#0f172a] border border-border-light shadow-2xl shadow-black/80 text-xs text-text-secondary leading-relaxed pointer-events-none select-none"
        >
          <p className="font-semibold text-text-primary mb-1 text-xs">
            Can't find your city?
          </p>
          <p className="text-[11px] text-text-muted mb-2">
            Try adding the country code after the name, for example:
          </p>
          <div className="flex flex-col gap-1 font-mono text-[11px] text-accent-blue font-medium bg-bg-glass/50 p-2 rounded-lg border border-border-default/40">
            <span>Paris FR</span>
            <span>Springfield US</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface ResultItemProps {
  city: CityResult;
  onSelect: (city: CityResult) => void;
  onToggleFavorite: (e: React.MouseEvent, city: CityResult) => void;
  onDeleteHistory: (e: React.MouseEvent, city: CityResult) => void;
  isLoggedIn: boolean;
}

function ResultItem({
  city,
  onSelect,
  onToggleFavorite,
  onDeleteHistory,
  isLoggedIn,
}: ResultItemProps) {
  return (
    <div
      onClick={() => onSelect(city)}
      className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-white/[0.04] transition-colors cursor-pointer group border-b border-border-light/20 last:border-b-0"
    >
      <CountryFlag countryCode={city.country} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-text-primary truncate">
            {city.name}
          </span>
          {city.state && (
            <span className="text-[11px] text-text-muted truncate hidden sm:inline">
              , {city.state}
            </span>
          )}
        </div>
        <div className="text-[10px] text-text-muted">
          {city.state ? `${city.state}, ` : ""}{city.country}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {isLoggedIn && city.isInSearchHistory && city.cityId !== null && (
          <button
            type="button"
            onClick={(e) => onDeleteHistory(e, city)}
            className="p-1 rounded text-text-muted hover:text-accent-red hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Remove from search history"
            aria-label="Remove from search history"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}

        <button
          type="button"
          onClick={(e) => onToggleFavorite(e, city)}
          className="p-1 rounded text-text-muted hover:text-amber-400 hover:bg-white/[0.06] transition-all cursor-pointer"
          title={
            city.isFavorite
              ? "Remove from favourites"
              : "Add to favourites"
          }
          aria-label={
            city.isFavorite
              ? "Remove from favourites"
              : "Add to favourites"
          }
        >
          {city.isFavorite ? (
            <svg
              className="w-4 h-4 text-amber-400 fill-amber-400"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-text-muted hover:text-amber-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export function CitySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

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
          const deduplicated = deduplicateCities(data.cities);
          setResults(deduplicated);
          setIsOpen(deduplicated.length > 0);
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
    getWeather(city.name)
      .then(() => notifyHomeListsChanged())
      .catch(() => {});
  }, []);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleToggleFavorite = async (e: React.MouseEvent, city: CityResult) => {
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    const currentlyFavorite = city.isFavorite;

    setResults((prev) =>
      prev.map((c) =>
        c.lat === city.lat && c.lon === city.lon
          ? { ...c, isFavorite: !currentlyFavorite }
          : c,
      ),
    );

    try {
      if (currentlyFavorite) {
        if (city.cityId) {
          await removeFavorite(city.cityId);
          notifyHomeListsChanged();
        } else {
          const favs = await getFavorites();
          const match = favs.favorites.find(
            (f) =>
              f.city.name.toLowerCase() === city.name.toLowerCase() &&
              f.city.country.toLowerCase() === city.country.toLowerCase(),
          );
          if (match) {
            await removeFavorite(match.cityId);
            notifyHomeListsChanged();
          }
        }
      } else {
        await addFavorite({
          name: city.name,
          state: city.state,
          country: city.country,
          lat: city.lat,
          lon: city.lon,
        });
        const favs = await getFavorites();
        const match = favs.favorites.find(
          (f) =>
            f.city.name.toLowerCase() === city.name.toLowerCase() &&
            f.city.country.toLowerCase() === city.country.toLowerCase(),
        );
        if (match) {
          setResults((prev) =>
            prev.map((c) =>
              c.lat === city.lat && c.lon === city.lon
                ? { ...c, cityId: match.cityId, isFavorite: true }
                : c,
            ),
          );
        }
        notifyHomeListsChanged();
      }
    } catch {
      setResults((prev) =>
        prev.map((c) =>
          c.lat === city.lat && c.lon === city.lon
            ? { ...c, isFavorite: currentlyFavorite }
            : c,
        ),
      );
    }
  };

  const handleDeleteHistory = async (e: React.MouseEvent, city: CityResult) => {
    e.stopPropagation();
    if (!city.cityId) return;

    setResults((prev) =>
      prev.map((c) =>
        c.cityId === city.cityId ? { ...c, isInSearchHistory: false } : c,
      ),
    );

    try {
      await deleteSearchHistoryEntry(city.cityId);
      notifyHomeListsChanged();
    } catch {
      setResults((prev) =>
        prev.map((c) =>
          c.cityId === city.cityId ? { ...c, isInSearchHistory: true } : c,
        ),
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
    if (e.key === "Enter" && results.length > 0) {
      handleSelect(results[0]);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm mx-auto">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 group/search">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none transition-colors group-hover/search:text-accent-blue group-focus-within/search:text-accent-blue"
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
            className="w-full h-8 pl-8 pr-8 bg-bg-card border border-border-light hover:border-accent-blue/50 hover:bg-bg-card-hover focus:border-accent-blue/50 focus:bg-bg-card-hover focus:ring-0 rounded-lg text-xs text-text-primary placeholder:text-text-muted outline-none transition-all"
          />

          {query.length > 0 && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-text-muted hover:text-accent-blue transition-colors cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}

          {isLoading && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 border border-text-muted border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        <SearchTooltip />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl border border-border-light bg-[#0f172a] shadow-2xl shadow-black/80 overflow-hidden divide-y divide-border-light/20">
          {results.map((city, i) => (
            <ResultItem
              key={`${city.name}-${city.country}-${city.state ?? ""}-${city.lat}-${city.lon}-${i}`}
              city={city}
              onSelect={handleSelect}
              onToggleFavorite={handleToggleFavorite}
              onDeleteHistory={handleDeleteHistory}
              isLoggedIn={Boolean(user)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
