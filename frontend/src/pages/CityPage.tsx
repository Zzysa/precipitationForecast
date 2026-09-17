import { useEffect, type CSSProperties } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useOutletContext,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCityWeather } from "../hooks/useCityWeather";
import type { WeatherLayoutContext } from "../layouts/AppLayout";
import "./CityPage.css";

type WeatherScene =
  "rain" | "clear" | "clouds" | "snow" | "storm" | "mist" | "neutral";

const scenes: Record<
  WeatherScene,
  { icon: string; label: string; photo: string }
> = {
  rain: { icon: "rain", label: "Rainy skies", photo: "rain-window.jpg" },
  clear: { icon: "clear-day", label: "Clear skies", photo: "clear.jpg" },
  clouds: { icon: "cloudy", label: "Cloudy skies", photo: "clouds.jpg" },
  snow: { icon: "snow", label: "Snowfall", photo: "snow.jpg" },
  storm: {
    icon: "thunderstorms-rain",
    label: "Thunderstorms",
    photo: "rain-window.jpg",
  },
  mist: { icon: "mist", label: "Misty skies", photo: "clouds.jpg" },
  neutral: {
    icon: "cloudy",
    label: "Current conditions unavailable",
    photo: "clouds.jpg",
  },
};

function getScene(conditions: string[] | null | undefined): WeatherScene {
  const value = conditions?.join(" ").toLowerCase() ?? "";
  if (value.includes("thunderstorm")) return "storm";
  if (/rain|drizzle/.test(value)) return "rain";
  if (value.includes("snow")) return "snow";
  if (value.includes("clear")) return "clear";
  if (value.includes("cloud")) return "clouds";
  if (/mist|fog|haze|smoke|dust|sand|ash/.test(value)) return "mist";
  return "neutral";
}

function WeatherIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const icons: Record<string, string> = {
    cloudy: "cloud-reference.png",
    rain: "rain-icon.png",
    "clear-day": "sun.svg",
    snow: "cloud-snow.svg",
    "thunderstorms-rain": "rain-icon.png",
    mist: "cloud-fog.svg",
    umbrella: "umbrella.svg",
    thermometer: "thermometer.svg",
  };
  return (
    <span
      aria-hidden="true"
      className={`weather-outline-icon ${className}`}
      style={
        {
          "--icon-source": `url("/weather/outline/${icons[name] ?? "cloud.svg"}")`,
        } as CSSProperties
      }
    />
  );
}

function percent(value: number | null | undefined) {
  return value == null || !Number.isFinite(value)
    ? "—"
    : `${Math.round(value)}%`;
}

function coordinate(value: string | null, limit: number) {
  if (!value?.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= limit
    ? number
    : undefined;
}

export function CityPage() {
  const { name = "" } = useParams();
  const [params] = useSearchParams();
  const { user, isLoading } = useAuth();
  if (isLoading)
    return (
      <div className="weather-loading" role="status">
        Loading weather…
      </div>
    );
  return (
    <CityWeather
      key={`${name}:${params}:${user?.id ?? "guest"}`}
      name={name}
      country={params.get("country")}
      lat={coordinate(params.get("lat"), 90)}
      lon={coordinate(params.get("lon"), 180)}
      userId={user?.id ?? null}
    />
  );
}

function CityWeather({
  name,
  country,
  lat,
  lon,
  userId,
}: {
  name: string;
  country: string | null;
  lat: number | undefined;
  lon: number | undefined;
  userId: number | null;
}) {
  const { weather, error, loading, now, retry } = useCityWeather(
    name,
    lat,
    lon,
    userId,
  );
  const { setWeatherPhoto } = useOutletContext<WeatherLayoutContext>();
  const scene = getScene(weather?.currentWeather?.condition);
  const theme = scenes[scene];
  const wet = scene === "rain" || scene === "storm";
  useEffect(() => {
    setWeatherPhoto(theme.photo);
    return () => setWeatherPhoto(null);
  }, [theme.photo, setWeatherPhoto]);
  const age = weather
    ? Math.max(0, Math.floor((now - weather.fetchedAt) / 60_000))
    : 0;
  const stale = Boolean(weather && (age >= 15 || error));
  const points =
    weather?.hourlyForecast.filter(
      (point) =>
        point.timestamp * 1000 >= now &&
        point.timestamp * 1000 < now + 24 * 60 * 60 * 1000,
    ) ?? [];
  const average = points.length
    ? points.reduce((sum, point) => sum + point.precipitationProbability, 0) /
      points.length
    : null;
  const maximum = points.length
    ? Math.max(...points.map((point) => point.precipitationProbability))
    : null;
  const next = points[0];
  const updated = age === 0 ? "Updated just now" : `Updated ${age} min ago`;

  return (
    <div className={`city-weather scene-${scene}`}>
      <div className="weather-content">
        <div className="weather-breadcrumb">
          <Link to="/">← All cities</Link>
          <span>YOUR LOCAL OUTLOOK</span>
        </div>

        {!weather ? (
          <section className="weather-glass weather-empty" aria-live="polite">
            <WeatherIcon name="cloudy" />
            <h1>
              {loading
                ? `Finding the forecast for ${name}`
                : "Weather is temporarily unavailable"}
            </h1>
            <p>
              {loading
                ? "A little moment, a clearer picture."
                : "We couldn’t load this city’s forecast. Please try again shortly."}
            </p>
            {error && (
              <button type="button" onClick={retry} disabled={loading}>
                Try again
              </button>
            )}
          </section>
        ) : (
          <>
            <div className="weather-overview">
              <section
                className="weather-glass weather-hero"
                aria-labelledby="city-title"
                aria-busy={loading}
              >
                <div className="weather-card-heading">
                  <span className={`weather-live${stale ? " is-stale" : ""}`}>
                    <i />
                    {stale ? "SAVED CONDITIONS" : "LIVE CONDITIONS"}
                  </span>
                  <span>
                    {new Date(weather.fetchedAt).toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="weather-hero-main">
                  <div className="weather-reading">
                    <div className="weather-city-name">
                      <h1 id="city-title">{name}</h1>
                      {country && <span>{country}</span>}
                    </div>
                    <div className="weather-percentage">
                      {average === null ? (
                        "—"
                      ) : (
                        <>
                          {Math.round(average)}
                          <span>%</span>
                        </>
                      )}
                    </div>
                    <p>Average chance of precipitation</p>
                    <span className="weather-period">
                      Over the next 24 hours
                    </span>
                  </div>
                  <div className="weather-condition">
                    <div className="weather-icon-orb">
                      <WeatherIcon name={theme.icon} />
                    </div>
                    <span>{theme.label}</span>
                  </div>
                </div>
                <div className="weather-hero-footer">
                  <span>
                    Humidity{" "}
                    <strong>{percent(weather.currentWeather?.humidity)}</strong>
                  </span>
                  <span>{loading ? "Refreshing…" : updated}</span>
                </div>
              </section>

              <aside
                className="weather-metrics"
                aria-label="Weather highlights"
              >
                <section className="weather-glass weather-metric">
                  <div className="weather-small-icon">
                    <WeatherIcon name="umbrella" />
                  </div>
                  <div>
                    <h2>Next 24h · Max precip chance</h2>
                    <strong>{percent(maximum)}</strong>
                  </div>
                </section>
                <section className="weather-glass weather-metric weather-metric-dark">
                  <div className="weather-small-icon">
                    <WeatherIcon name="thermometer" />
                  </div>
                  <div>
                    <h2>Current temperature</h2>
                    <strong>
                      {weather.currentWeather?.temp == null
                        ? "—"
                        : `${Math.round(weather.currentWeather.temp)}°`}
                      <small>
                        {weather.currentWeather?.temp == null ? "" : "C"}
                      </small>
                    </strong>
                  </div>
                </section>
                <section className="weather-glass weather-metric">
                  <div className="weather-small-icon">
                    <WeatherIcon name="umbrella" />
                  </div>
                  <div>
                    <h2>Next forecast · Precip chance</h2>
                    <strong>{percent(next?.precipitationProbability)}</strong>
                    {next && (
                      <span className="weather-metric-time">
                        {new Date(next.timestamp * 1000).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </span>
                    )}
                  </div>
                </section>
              </aside>
            </div>
            <div className="weather-status" role="status">
              <span>
                {error
                  ? "Update failed. Showing the last saved forecast; we’ll retry automatically."
                  : stale
                    ? "This forecast is due for an update."
                    : "A fresh outlook, every 15 minutes."}
              </span>
              {error && (
                <button type="button" onClick={retry} disabled={loading}>
                  Retry now
                </button>
              )}
            </div>
          </>
        )}
        <div className="weather-scene-note">
          <span>
            {wet
              ? "A quiet moment between the raindrops."
              : scene === "clear"
                ? "A little sunshine for your day."
                : "Whatever the skies bring, be ready."}
          </span>
        </div>
      </div>
    </div>
  );
}
