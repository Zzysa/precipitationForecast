import { api } from "./client";


// ─── Types ───────────────────────────────────────────────────────────────────

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
}

export interface HourlyAirPollutionPoint {
  timestamp: number;
  aqi: number;
}

export interface CurrentWeather {
  tempDay: number | null;
  tempNight: number | null;
  condition: string[] | null;
}

export interface WeatherData {
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

// ─── API calls ───────────────────────────────────────────────────────────────

export function searchCities(city: string, country?: string): Promise<{ cities: CityResult[] }> {
  const params = new URLSearchParams({ city });
  if (country) params.set("country", country);
  return api.get(`/api/city-search?${params}`);
}

export function getWeather(city: string): Promise<{ city: WeatherData }> {
  return api.get(`/api/weather/${encodeURIComponent(city)}`);
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

