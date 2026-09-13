import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getFavorites,
  getSearchHistory,
  deleteSearchHistoryEntry,
  type FavoriteCity,
  type SearchHistoryEntry,
} from "../api/weather";

// ─── Country flag emoji helper ────────────────────────────────────────────────

function countryFlag(countryCode: string): string {
  // ISO 3166-1 alpha-2 → regional indicator emoji
  return countryCode
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

function cityNavKey(name: string, country: string): string {
  return `${name},${country}`;
}

// ─── Favourite cards ──────────────────────────────────────────────────────────

interface FavoriteCardProps {
  favorite: FavoriteCity;
  onClick: () => void;
}

function FavoriteCard({ favorite, onClick }: FavoriteCardProps) {
  const { city } = favorite;
  const flag = city.country.length === 2 ? countryFlag(city.country) : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-shrink-0 flex flex-col items-center gap-1.5 px-5 py-4 rounded-2xl bg-bg-card border border-border-light hover:bg-bg-card-hover hover:border-accent-blue/30 transition-all cursor-pointer group"
    >
      <span className="text-2xl">{flag || "🌍"}</span>
      <span className="text-sm font-medium text-text-primary group-hover:text-accent-blue transition-colors whitespace-nowrap">
        {city.name}
      </span>
      <span className="text-xs text-text-muted">{city.country}</span>
    </button>
  );
}

// ─── History row ──────────────────────────────────────────────────────────────

interface HistoryRowProps {
  entry: SearchHistoryEntry;
  onNavigate: () => void;
  onDelete: () => void;
}

function HistoryRow({ entry, onNavigate, onDelete }: HistoryRowProps) {
  const { city } = entry;
  const flag = city.country.length === 2 ? countryFlag(city.country) : "";
  const date = new Date(entry.searchedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-card border border-border-light hover:bg-bg-card-hover transition-all group">
      <button
        type="button"
        onClick={onNavigate}
        className="flex-1 flex items-center gap-3 text-left cursor-pointer min-w-0"
      >
        <span className="text-lg shrink-0">{flag || "🌍"}</span>
        <span className="text-sm text-text-primary truncate">{city.name}</span>
        <span className="text-xs text-text-muted shrink-0">{city.country}</span>
        <span className="ml-auto text-xs text-text-muted shrink-0">{date}</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="shrink-0 text-text-muted hover:text-accent-red transition-colors cursor-pointer p-1"
        aria-label="Remove from history"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">{title}</h2>
      {children}
    </section>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setDataLoading(true);

    Promise.all([getFavorites(), getSearchHistory()])
      .then(([favData, histData]) => {
        if (cancelled) return;
        setFavorites(favData.favorites);
        setHistory(histData.history);
      })
      .catch(() => {
        // Silently ignore — the sections will stay empty
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  function handleDeleteHistoryEntry(cityId: number) {
    setHistory((prev) => prev.filter((h) => h.cityId !== cityId));
    deleteSearchHistoryEntry(cityId).catch(() => {
      // Reload on failure
      getSearchHistory().then((d) => setHistory(d.history)).catch(() => {});
    });
  }

  // Show spinner while auth is resolving
  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-6 py-8 max-w-2xl mx-auto w-full gap-8">

      {/* Logged-out empty state */}
      {!user && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-bg-card border border-border-light flex items-center justify-center">
            <svg className="w-8 h-8 text-accent-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-text-primary">Start searching</h1>
          <p className="text-sm text-text-secondary max-w-xs">
            Search for any city using the bar above.
            <br />
            Sign in to save favourites and see your search history.
          </p>
        </div>
      )}

      {/* Logged-in content */}
      {user && (
        <>
          {/* Favourites */}
          <Section title="Favourites">
            {dataLoading ? (
              <div className="h-24 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin" />
              </div>
            ) : favorites.length === 0 ? (
              <p className="text-sm text-text-muted py-4">
                No favourites yet — search for a city and add it as a favourite.
              </p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                {favorites.map((fav) => (
                  <FavoriteCard
                    key={fav.id}
                    favorite={fav}
                    onClick={() => navigate(`/city/${encodeURIComponent(cityNavKey(fav.city.name, fav.city.country))}`)}
                  />
                ))}
              </div>
            )}
          </Section>

          {/* Search history */}
          <Section title="Recent searches">
            {dataLoading ? (
              <div className="h-16 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-text-muted py-4">
                No recent searches yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {history.map((entry) => (
                  <HistoryRow
                    key={entry.id}
                    entry={entry}
                    onNavigate={() => navigate(`/city/${encodeURIComponent(cityNavKey(entry.city.name, entry.city.country))}`)}
                    onDelete={() => handleDeleteHistoryEntry(entry.cityId)}
                  />
                ))}
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
