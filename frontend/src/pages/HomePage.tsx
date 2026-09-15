import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { CountryFlag } from "../components/CountryFlag";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  getSearchHistory,
  deleteSearchHistoryEntry,
  type FavoriteCity,
  type SearchHistoryEntry,
} from "../api/weather";

const HOME_LISTS_CHANGED = "home-lists-changed";

function RemoveIcon() {
  return (
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
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
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
    );
  }

  return (
    <svg
      className="w-4 h-4"
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
  );
}

interface FavoriteCardProps {
  favorite: FavoriteCity;
  onDelete: () => void;
}

function FavoriteCard({ favorite, onDelete }: FavoriteCardProps) {
  const { city } = favorite;

  return (
    <div className="group relative flex w-full flex-col items-center gap-1.5 pt-4 pb-4 pl-5 pr-5 rounded-2xl bg-bg-card border border-border-light hover:bg-bg-card-hover hover:border-accent-blue/50 transition-all">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-1.5 right-1.5 inline-flex items-center justify-center w-7 h-7 rounded-lg text-text-muted hover:text-accent-red hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
        aria-label="Remove favourite"
      >
        <RemoveIcon />
      </button>
      <CountryFlag countryCode={city.country} size="md" />
      <span className="text-sm font-medium text-text-primary group-hover:text-accent-blue transition-colors whitespace-nowrap truncate max-w-full">
        {city.name}
      </span>
      <span className="text-xs text-text-muted">{city.country}</span>
    </div>
  );
}

interface HistoryRowProps {
  entry: SearchHistoryEntry;
  isFavorite: boolean;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

function HistoryRow({
  entry,
  isFavorite,
  onDelete,
  onToggleFavorite,
}: HistoryRowProps) {
  const { city } = entry;
  const date = new Date(entry.searchedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="group relative flex items-center gap-3 px-4 py-2.5 rounded-xl bg-bg-card border border-border-light hover:bg-bg-card-hover hover:border-accent-blue/50 transition-all">
      <CountryFlag countryCode={city.country} size="sm" />
      <span className="text-sm text-text-primary truncate group-hover:text-accent-blue transition-colors">
        {city.name}
      </span>
      <span className="text-xs text-text-muted shrink-0">{city.country}</span>
      <div className="ml-auto relative shrink-0 h-7 min-w-[3.5rem] flex items-center justify-end">
        <span className="text-xs text-text-muted transition-opacity group-hover:opacity-0">
          {date}
        </span>
        <div className="absolute inset-y-0 right-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-text-muted hover:text-amber-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
            title={isFavorite ? "Remove from favourites" : "Add to favourites"}
          >
            <StarIcon filled={isFavorite} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-text-muted hover:text-accent-red hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label="Remove from history"
          >
            <RemoveIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function HomePage() {
  const { user, isLoading: authLoading } = useAuth();

  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadLists = (showSpinner = false) => {
      if (showSpinner) setDataLoading(true);
      Promise.all([getFavorites(), getSearchHistory()])
        .then(([favData, histData]) => {
          if (cancelled) return;
          setFavorites(favData.favorites);
          setHistory(histData.history);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setDataLoading(false);
        });
    };

    loadLists(true);
    const onListsChanged = () => loadLists(false);
    window.addEventListener(HOME_LISTS_CHANGED, onListsChanged);

    return () => {
      cancelled = true;
      window.removeEventListener(HOME_LISTS_CHANGED, onListsChanged);
    };
  }, [user]);

  function handleDeleteFavorite(cityId: number) {
    setFavorites((prev) => prev.filter((f) => f.cityId !== cityId));
    removeFavorite(cityId).catch(() => {
      getFavorites()
        .then((d) => setFavorites(d.favorites))
        .catch(() => {});
    });
  }

  function handleDeleteHistoryEntry(cityId: number) {
    setHistory((prev) => prev.filter((h) => h.cityId !== cityId));
    deleteSearchHistoryEntry(cityId).catch(() => {
      getSearchHistory()
        .then((d) => setHistory(d.history))
        .catch(() => {});
    });
  }

  async function handleToggleFavoriteFromHistory(entry: SearchHistoryEntry) {
    const alreadyFavorite = favorites.some((f) => f.cityId === entry.cityId);

    if (alreadyFavorite) {
      setFavorites((prev) => prev.filter((f) => f.cityId !== entry.cityId));
      try {
        await removeFavorite(entry.cityId);
      } catch {
        const data = await getFavorites().catch(() => null);
        if (data) setFavorites(data.favorites);
      }
      return;
    }

    const optimistic: FavoriteCity = {
      id: -entry.cityId,
      userId: entry.userId,
      cityId: entry.cityId,
      createdAt: new Date().toISOString(),
      city: entry.city,
    };
    setFavorites((prev) => [optimistic, ...prev]);

    try {
      await addFavorite({
        name: entry.city.name,
        state: entry.city.state,
        country: entry.city.country,
        lat: entry.city.lat,
        lon: entry.city.lon,
      });
      const data = await getFavorites();
      setFavorites(data.favorites);
    } catch {
      setFavorites((prev) => prev.filter((f) => f.cityId !== entry.cityId));
    }
  }

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-6 py-8 max-w-2xl mx-auto w-full gap-8">
      {!user && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-bg-card border border-border-light flex items-center justify-center">
            <svg
              className="w-8 h-8 text-accent-blue"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-text-primary">
            Start searching
          </h1>
          <p className="text-sm text-text-secondary max-w-xs">
            Search for any city using the search bar above.
            <br />
            Sign in to save favourites and see your search history.
          </p>
        </div>
      )}

      {user && (
        <>
          <Section title="Favourites">
            {dataLoading ? (
              <div className="h-24 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin" />
              </div>
            ) : favorites.length === 0 ? (
              <p className="text-sm text-text-muted py-4">
                No favourites yet — search for a city and click ⭐ to add it.
              </p>
            ) : (
              <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(6.75rem,1fr))] gap-3">
                {favorites.map((fav) => (
                  <FavoriteCard
                    key={fav.id}
                    favorite={fav}
                    onDelete={() => handleDeleteFavorite(fav.cityId)}
                  />
                ))}
              </div>
            )}
          </Section>

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
                    isFavorite={favorites.some((f) => f.cityId === entry.cityId)}
                    onDelete={() => handleDeleteHistoryEntry(entry.cityId)}
                    onToggleFavorite={() => handleToggleFavoriteFromHistory(entry)}
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
