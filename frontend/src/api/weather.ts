import { api } from "./client";

export interface CityResult {
  cityId: number | null;
  name: string;
  state: string | null;
  country: string;
  lat: number;
  lon: number;
  isFavorite: boolean;
  isInSearchHistory: boolean;
}

export interface HourlyForecastPoint {
  timestamp: number;
  temp: number;
  precipitationProbability: number;
  condition?: string;
  weatherIcon?: string;
}

export interface HourlyAirPollutionPoint {
  timestamp: number;
  aqi: number;
}

export interface CurrentWeather {
  temp: number | null;
  humidity: number | null;
  tempDay: number | null;
  tempNight: number | null;
  condition: string[] | null;
}

export interface WeatherData {
  fetchedAt: number;
  timezoneOffset?: number;
  hourlyForecast: HourlyForecastPoint[];
  maxPrecipitationChance: number | null;
  avgPrecipitationChance: number | null;
  currentWeather: CurrentWeather | null;
  avgAirPollution: number | null;
  hourlyAirPollution: HourlyAirPollutionPoint[] | null;
}

export interface FavoriteCity {
  id: number;
  userId: number;
  cityId: number;
  createdAt: string;
  city: {
    id: number;
    name: string;
    state: string | null;
    country: string;
    lat: number;
    lon: number;
  };
}

export interface SearchHistoryEntry {
  id: number;
  userId: number;
  cityId: number;
  searchedAt: string;
  city: {
    id: number;
    name: string;
    state: string | null;
    country: string;
    lat: number;
    lon: number;
  };
}

export interface AddFavoritePayload {
  name: string;
  state: string | null;
  country: string;
  lat: number;
  lon: number;
}

export function searchCities(
  city: string,
  country?: string,
): Promise<{ cities: CityResult[] }> {
  const params = new URLSearchParams({ city });
  if (country) params.set("country", country);
  return api.get(`/api/city-search?${params}`);
}

export const WEATHER_REFRESH_INTERVAL = 15 * 60 * 1000;

export interface CityLocation {
  name: string;
  country?: string;
  lat?: number;
  lon?: number;
}

export function cityPath(city: CityLocation): string {
  const params = new URLSearchParams();
  if (city.country) params.set("country", city.country);
  if (city.lat !== undefined && city.lon !== undefined) {
    params.set("lat", String(city.lat));
    params.set("lon", String(city.lon));
  }
  return `/city/${encodeURIComponent(city.name)}${params.size ? `?${params}` : ""}`;
}

const weatherCache = new Map<string, { city: WeatherData }>();
const pendingWeather = new Map<string, Promise<{ city: WeatherData }>>();

export function getWeather(
  city: string,
  coordinates?: { lat: number; lon: number },
): Promise<{ city: WeatherData }> {
  const query = coordinates
    ? `?${new URLSearchParams({ lat: String(coordinates.lat), lon: String(coordinates.lon) })}`
    : "";
  const endpoint = `/api/weather/${encodeURIComponent(city)}${query}`;
  const key = `${endpoint}:${localStorage.getItem("accessToken") ?? "guest"}`;
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.city.fetchedAt < WEATHER_REFRESH_INTERVAL)
    return Promise.resolve(cached);
  const pending = pendingWeather.get(key);
  if (pending) return pending;
  const request = api
    .get<{ city: WeatherData }>(endpoint)
    .then((result) => {
      if (weatherCache.size >= 50) {
        const oldest = weatherCache.keys().next().value;
        if (oldest !== undefined) weatherCache.delete(oldest);
      }
      weatherCache.set(key, result);
      return result;
    })
    .finally(() => pendingWeather.delete(key));
  pendingWeather.set(key, request);
  return request;
}

export function getFavorites(): Promise<{ favorites: FavoriteCity[] }> {
  return api.get("/api/favorites");
}

export function addFavorite(payload: AddFavoritePayload): Promise<void> {
  return api.post("/api/favorites", payload);
}

export function removeFavorite(cityId: number): Promise<void> {
  return api.delete(`/api/favorites/${cityId}`);
}

export function getSearchHistory(): Promise<{ history: SearchHistoryEntry[] }> {
  return api.get("/api/search-history");
}

export function deleteSearchHistoryEntry(cityId: number): Promise<void> {
  return api.delete(`/api/search-history/${cityId}`);
}
