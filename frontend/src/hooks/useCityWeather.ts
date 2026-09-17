import { useCallback, useEffect, useState } from "react";
import {
  getWeather,
  WEATHER_REFRESH_INTERVAL,
  type WeatherData,
} from "../api/weather";

export function useCityWeather(
  city: string,
  lat: number | undefined,
  lon: number | undefined,
  userId: number | null,
) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [now, setNow] = useState(Date.now());
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;
    let running = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let nextRefresh = 0;

    async function refresh() {
      if (cancelled || running || document.hidden) return;
      running = true;
      setLoading(true);
      try {
        const result = await getWeather(
          city,
          lat !== undefined && lon !== undefined ? { lat, lon } : undefined,
        );
        if (cancelled) return;
        setWeather(result.city);
        setError(false);
        setNow(Date.now());
        nextRefresh = Math.max(
          Date.now() + 1000,
          result.city.fetchedAt + WEATHER_REFRESH_INTERVAL,
        );
        window.dispatchEvent(new Event("home-lists-changed"));
      } catch {
        if (cancelled) return;
        setError(true);
        nextRefresh = Date.now() + 60_000;
      } finally {
        running = false;
        if (!cancelled) {
          setLoading(false);
          clearTimeout(timer);
          timer = setTimeout(
            () => void refresh(),
            Math.max(1000, nextRefresh - Date.now()),
          );
        }
      }
    }

    function onVisibilityChange() {
      if (document.hidden) {
        clearTimeout(timer);
      } else {
        setNow(Date.now());
        if (Date.now() >= nextRefresh) void refresh();
        else {
          clearTimeout(timer);
          timer = setTimeout(() => void refresh(), nextRefresh - Date.now());
        }
      }
    }

    void refresh();
    const clock = setInterval(() => {
      if (!document.hidden) setNow(Date.now());
    }, 30_000);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("online", refresh);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearInterval(clock);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("online", refresh);
    };
  }, [city, lat, lon, userId, attempt]);

  return { weather, error, loading, now, retry };
}
