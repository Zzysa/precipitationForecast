import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import {
  getWeather,
  addFavorite,
  removeFavorite,
  getFavorites,
  type WeatherData,
} from "../api/weather";

// ─── Constants ────────────────────────────────────────────────────────────────

const AQI_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Good", color: "#34d399" },
  2: { label: "Fair", color: "#a3e635" },
  3: { label: "Moderate", color: "#facc15" },
  4: { label: "Poor", color: "#fb923c" },
  5: { label: "Very Poor", color: "#f87171" },
};

const CONDITION_ICONS: Record<string, string> = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
  Mist: "🌫️",
  Fog: "🌫️",
  Haze: "🌫️",
  Smoke: "🌫️",
  Dust: "🌫️",
  Sand: "🌫️",
  Ash: "🌫️",
  Squall: "💨",
  Tornado: "🌪️",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatHour(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function precipColor(pct: number): string {
  if (pct < 25) return "#bfdbfe";
  if (pct < 50) return "#60a5fa";
  if (pct < 75) return "#3b82f6";
  return "#1d4ed8";
}

// ─── Custom tooltip for the chart ─────────────────────────────────────────────

function PrecipTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="px-3 py-2 rounded-lg bg-bg-card border border-border-light text-xs text-text-primary shadow-lg">
      <p className="text-text-muted">{label}</p>
      <p className="font-medium text-accent-blue">{payload[0].value}% rain</p>
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-bg-card border border-border-light animate-pulse ${className}`} />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CityPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const [togglingFav, setTogglingFav] = useState(false);

  // Decoded city name from URL ("Paris,FR" → "Paris,FR")
  const cityParam = name ? decodeURIComponent(name) : "";
  // For the weather API we only pass the city portion before the comma
  const cityForApi = cityParam.split(",")[0].trim();

  // Display name: take first part only
  const displayName = cityParam.split(",")[0].trim();
  const displayCountry = cityParam.includes(",") ? cityParam.split(",").slice(1).join(",").trim() : "";

  useEffect(() => {
    if (!cityParam) return;

    setIsLoading(true);
    setError(null);

    getWeather(cityForApi)
      .then((data) => setWeather(data.city))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load weather data"))
      .finally(() => setIsLoading(false));
  }, [cityParam, cityForApi]);

  // Check if already a favourite
  useEffect(() => {
    if (!user) return;
    getFavorites()
      .then((data) => {
        const match = data.favorites.find(
          (f) => f.city.name.toLowerCase() === displayName.toLowerCase()
        );
        if (match) {
          setIsFavorite(true);
          setFavoriteId(match.cityId);
        }
      })
      .catch(() => {});
  }, [user, displayName]);

  async function toggleFavorite() {
    if (!weather || togglingFav) return;
    setTogglingFav(true);

    try {
      if (isFavorite && favoriteId !== null) {
        await removeFavorite(favoriteId);
        setIsFavorite(false);
        setFavoriteId(null);
      } else {
        await addFavorite({
          name: displayName,
          state: null,
          country: displayCountry || "??",
          lat: 0, // We don't have lat/lon from URL — send minimal payload.
          lon: 0, // The backend will upsert by lat_lon which may create duplicates.
          // TODO: carry lat/lon through the URL in a future PR.
        });
        // Re-fetch to get the new favorite id
        const data = await getFavorites();
        const match = data.favorites.find(
          (f) => f.city.name.toLowerCase() === displayName.toLowerCase()
        );
        if (match) {
          setIsFavorite(true);
          setFavoriteId(match.cityId);
        }
      }
    } catch {
      // Silently ignore toggle failures
    } finally {
      setTogglingFav(false);
    }
  }

  // ─── Loading state ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col px-6 py-8 max-w-2xl mx-auto w-full gap-4">
        <SkeletonCard className="h-40" />
        <SkeletonCard className="h-48" />
        <SkeletonCard className="h-28" />
      </div>
    );
  }

  // ─── Error state ───────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-accent-red/10 flex items-center justify-center text-2xl">⚠️</div>
        <h1 className="text-lg font-semibold text-text-primary">{error}</h1>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-accent-blue hover:underline cursor-pointer"
        >
          ← Go back
        </button>
      </div>
    );
  }

  if (!weather) return null;

  const { currentWeather, hourlyForecast, maxPrecipitationChance, avgAirPollution, hourlyAirPollution } = weather;
  const conditions = currentWeather?.condition ?? [];
  const primaryCondition = conditions[0] ?? null;
  const conditionIcon = primaryCondition ? (CONDITION_ICONS[primaryCondition] ?? "🌤️") : null;

  const chartData = hourlyForecast.map((p) => ({
    time: formatHour(p.timestamp),
    rain: p.precipitationProbability,
  }));

  const avgAqi = avgAirPollution !== null ? Math.round(avgAirPollution) : null;
  const aqiInfo = avgAqi !== null ? (AQI_LABELS[avgAqi] ?? AQI_LABELS[3]) : null;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col px-6 py-8 max-w-2xl mx-auto w-full gap-4">

      {/* ── Current weather card ── */}
      <div className="relative rounded-2xl bg-bg-card border border-border-light p-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(0.7_0.15_220_/_0.08)_0%,_transparent_60%)] pointer-events-none" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-text-primary truncate">{displayName}</h1>
            {displayCountry && (
              <p className="text-sm text-text-muted mt-0.5">{displayCountry}</p>
            )}
            {primaryCondition && (
              <p className="text-sm text-text-secondary mt-2">{conditionIcon} {primaryCondition}</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* Favourite toggle */}
            {user && (
              <button
                type="button"
                onClick={toggleFavorite}
                disabled={togglingFav}
                className={`text-xl transition-all cursor-pointer ${isFavorite ? "opacity-100" : "opacity-40 hover:opacity-70"} ${togglingFav ? "animate-pulse" : ""}`}
                aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
              >
                ⭐
              </button>
            )}

            {/* AQI badge */}
            {aqiInfo && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${aqiInfo.color}20`, color: aqiInfo.color }}
              >
                AQI · {aqiInfo.label}
              </span>
            )}
          </div>
        </div>

        {/* Temperature */}
        {currentWeather && (
          <div className="flex items-end gap-6 mt-5">
            {currentWeather.tempDay !== null && (
              <div>
                <p className="text-xs text-text-muted">Day</p>
                <p className="text-4xl font-bold text-text-primary leading-none">
                  {Math.round(currentWeather.tempDay)}°
                </p>
              </div>
            )}
            {currentWeather.tempNight !== null && (
              <div>
                <p className="text-xs text-text-muted">Night</p>
                <p className="text-4xl font-bold text-text-secondary leading-none">
                  {Math.round(currentWeather.tempNight)}°
                </p>
              </div>
            )}
          </div>
        )}

        {/* Max precipitation summary */}
        {maxPrecipitationChance !== null && (
          <div className="mt-4 flex items-center gap-1.5 text-xs text-text-muted">
            <svg className="w-3 h-3 text-accent-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            <span>Up to <span className="text-accent-blue font-medium">{maxPrecipitationChance}%</span> chance of rain in the next 24 h</span>
          </div>
        )}
      </div>

      {/* ── Precipitation chart ── */}
      <div className="rounded-2xl bg-bg-card border border-border-light p-6">
        <h2 className="text-sm font-medium text-text-secondary mb-4">Hourly precipitation probability</h2>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="time"
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={3}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<PrecipTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="rain" radius={[3, 3, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={precipColor(entry.rain)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Air quality card ── */}
      {avgAqi !== null && aqiInfo && (
        <div className="rounded-2xl bg-bg-card border border-border-light p-6">
          <h2 className="text-sm font-medium text-text-secondary mb-3">Air quality index</h2>

          {/* Scale bar */}
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className="flex-1 h-1.5 rounded-full transition-all"
                style={{
                  backgroundColor: level <= avgAqi
                    ? AQI_LABELS[level]?.color
                    : "oklch(1 0 0 / 0.08)",
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Good</span>
            <span
              className="text-sm font-semibold"
              style={{ color: aqiInfo.color }}
            >
              {aqiInfo.label}
            </span>
            <span className="text-xs text-text-muted">Very Poor</span>
          </div>

          {/* Hourly AQI sparkline preview */}
          {hourlyAirPollution && hourlyAirPollution.length > 0 && (
            <div className="flex items-end gap-0.5 mt-4 h-8">
              {hourlyAirPollution.map((p, i) => {
                const pct = (p.aqi / 5) * 100;
                const info = AQI_LABELS[p.aqi] ?? AQI_LABELS[3];
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${Math.max(pct, 10)}%`,
                      backgroundColor: info.color,
                      opacity: 0.7,
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
