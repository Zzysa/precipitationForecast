import type { HourlyAirPollutionPoint } from "../api/weather";

export const airLevels = [
  { label: "Good", color: "#8de0bd" },
  { label: "Fair", color: "#c6df91" },
  { label: "Moderate", color: "#f2ce83" },
  { label: "Poor", color: "#f1a17d" },
  { label: "Very poor", color: "#e79aac" },
];

export function currentAirQuality(
  points: HourlyAirPollutionPoint[] | null | undefined,
  now: number,
) {
  // Each OpenWeather forecast point covers one hour; never reuse an expired one.
  const point = points?.filter(
    ({ timestamp, aqi }) =>
      Number.isFinite(timestamp) &&
      timestamp * 1000 <= now &&
      now < timestamp * 1000 + 3_600_000 &&
      Number.isInteger(aqi) && aqi >= 1 && aqi <= 5,
  ).sort((a, b) => b.timestamp - a.timestamp)[0];

  return point ? { aqi: point.aqi, ...airLevels[point.aqi - 1] } : null;
}
