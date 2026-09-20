import type { WeatherResponseDTO } from "../dtos/weather.dto.js";
import { mapToWeatherDTO } from "../mappers/weather.mapper.js";
import type {
	OWAirPollutionResponse,
	OWCurrentWeatherResponse,
	OWForecastResponse,
} from "../dtos/openWeather.dto.js";
import { prisma } from "../db/prisma.js";

interface Coordinates {
	lat: number;
	lon: number;
}

interface CachedWeather {
	data: WeatherResponseDTO;
	city: OWForecastResponse["city"];
	expiresAt: number;
}

type ForecastMode = "hourly" | "3h";

const CACHE_TTL = 15 * 60 * 1000;
const CACHE_LIMIT = 500;

const weatherCache = new Map<string, CachedWeather>();
const pendingWeather = new Map<string, Promise<CachedWeather>>();

const clearWeatherCache = () => {
	weatherCache.clear();
	pendingWeather.clear();
};

const getForecastMode = (): ForecastMode =>
	process.env.FORECAST_MODE === "3h" ? "3h" : "hourly";

const fetchJson = async <T>(url: string): Promise<T> => {
	const response = await fetch(url, {
		signal: AbortSignal.timeout(15_000),
	});

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(errorBody);
	}

	return response.json() as Promise<T>;
};

const loadWeather = async (
	query: string,
	mode: ForecastMode,
): Promise<CachedWeather> => {
	const forecastUrl =
		mode === "hourly"
			? "https://pro.openweathermap.org/data/2.5/forecast/hourly"
			: "https://api.openweathermap.org/data/2.5/forecast";

	const auth = `appid=${process.env.WEATHER_API_KEY}`;
	const forecastCount = mode === "hourly" ? "&cnt=24" : "";

	const [currentResult, forecastResult] = await Promise.allSettled([
		fetchJson<OWCurrentWeatherResponse>(
			`https://api.openweathermap.org/data/2.5/weather?${query}&${auth}&units=metric`,
		),
		fetchJson<OWForecastResponse>(
			`${forecastUrl}?${query}${forecastCount}&${auth}&units=metric`,
		),
	]);

	if (forecastResult.status === "rejected") {
		throw forecastResult.reason;
	}

	const forecast = forecastResult.value;
	const { lat, lon } = forecast.city.coord;

	const current =
		currentResult.status === "fulfilled" ? currentResult.value : null;

	const pollution = await fetchJson<OWAirPollutionResponse>(
		`https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&${auth}`,
	).catch(() => null);

	const fetchedAt = Date.now();

	return {
		data: {
			...mapToWeatherDTO(forecast, current, pollution),
			fetchedAt,
		},
		city: forecast.city,
		expiresAt: fetchedAt + CACHE_TTL,
	};
};

const getCachedWeather = async (query: string): Promise<CachedWeather> => {
	const mode = getForecastMode();
	const key = `${mode}:${query}`;

	const cached = weatherCache.get(key);

	if (cached && cached.expiresAt > Date.now()) {
		return cached;
	}

	const pending = pendingWeather.get(key);

	if (pending) {
		return pending;
	}

	const request = loadWeather(query, mode)
		.then((result) => {
			for (const [entryKey, entry] of weatherCache) {
				if (entry.expiresAt <= Date.now()) {
					weatherCache.delete(entryKey);
				}
			}

			if (weatherCache.size >= CACHE_LIMIT) {
				const oldest = weatherCache.keys().next().value;

				if (oldest !== undefined) {
					weatherCache.delete(oldest);
				}
			}

			weatherCache.set(key, result);

			return result;
		})
		.finally(() => {
			pendingWeather.delete(key);
		});

	pendingWeather.set(key, request);

	return request;
};

const getWeatherByCity = async (
	city: string,
	userId: number | null,
	coordinates?: Coordinates,
): Promise<WeatherResponseDTO> => {
	const query = coordinates
		? `lat=${coordinates.lat}&lon=${coordinates.lon}`
		: `q=${encodeURIComponent(city.trim())}`;

	const result = await getCachedWeather(query);

	const {
		coord: { lat, lon },
		country,
		name,
	} = result.city;

	if (userId !== null) {
		const savedCity = await prisma.city.upsert({
			where: { lat_lon: { lat, lon } },
			update: { name, country },
			create: {
				name,
				lat,
				lon,
				state: null,
				country,
			},
			select: { id: true },
		});

		await prisma.searchHistory.upsert({
			where: {
				userId_cityId: {
					userId,
					cityId: savedCity.id,
				},
			},
			update: {
				searchedAt: new Date(),
			},
			create: {
				userId,
				cityId: savedCity.id,
			},
		});
	}

	return result.data;
};

export { getWeatherByCity, clearWeatherCache };
