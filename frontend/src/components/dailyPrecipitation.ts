import type { HourlyForecastPoint } from "../api/weather";

const DAY = 24 * 60 * 60 * 1000;

export function dailyPrecipitation(
  forecast: HourlyForecastPoint[],
  now: number,
  cityOffset?: number,
) {
  const hasCityTime =
    typeof cityOffset === "number" && Number.isFinite(cityOffset);
  const offset =
    (hasCityTime ? cityOffset : -new Date(now).getTimezoneOffset() * 60) * 1000;
  const dayOf = (timestamp: number) => Math.floor((timestamp + offset) / DAY);
  const today = dayOf(now);
  const available = forecast
    .filter(
      (point) =>
        Number.isFinite(point.timestamp) &&
        point.timestamp * 1000 >= now &&
        Number.isFinite(point.precipitationProbability) &&
        point.precipitationProbability >= 0 &&
        point.precipitationProbability <= 100,
    )
    .sort((a, b) => a.timestamp - b.timestamp)
    .filter(
      (point, index, points) =>
        index === 0 || point.timestamp !== points[index - 1].timestamp,
    );
  const day = available.length ? dayOf(available[0].timestamp * 1000) : today;
  const points = available.filter(
    (point) => dayOf(point.timestamp * 1000) === day,
  );
  const label =
    day === today
      ? "Today"
      : day === today + 1
        ? "Tomorrow"
        : new Date(day * DAY).toLocaleDateString("en", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          });
  return {
    label,
    average: points.length
      ? points.reduce((sum, point) => sum + point.precipitationProbability, 0) /
        points.length
      : null,
    note: points.length
      ? day === today
        ? "Remaining forecast hours"
        : "Available forecast hours"
      : "Forecast unavailable",
    hasCityTime,
  };
}
