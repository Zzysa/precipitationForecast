import type { WeatherResponseDTO } from "../dtos/weather.dto.js";
import { mapToWeatherDTO } from "../mappers/weather.mapper.js";
import type {
	OWAirPollutionResponse,
	OWCurrentWeatherResponse,
	OWForecastResponse,
} from "../dtos/openWeather.dto.js";
import { prisma } from "../db/prisma.js";

const fetchCurrentWeather = async (city: string) => {
	const response = await fetch(
		`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`,
	);

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(errorBody);
	}

	return response;
};

const fetchAirPollution = async (lat: number, lon: number) => {
	const response = await fetch(
		`https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}`,
	);

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(errorBody);
	}

	return response;
};

const fetchForecast = async (city: string) => {
	const response = await fetch(
		`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`,
	);

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(errorBody);
	}

	return response;
};

const getWeatherByCity = async (city: string): Promise<WeatherResponseDTO> => {
	const safeCity = encodeURIComponent(city);

	const [currentSettled, forecastSettled] = await Promise.allSettled([
		fetchCurrentWeather(safeCity),
		fetchForecast(safeCity),
	]);

	if (forecastSettled.status === "rejected") {
		throw forecastSettled.reason;
	}

	const forecast = (await forecastSettled.value.json()) as OWForecastResponse;
	const { lat, lon } = forecast.city.coord;
	const { country, name } = forecast.city;

	const demoUser = await prisma.user.findUniqueOrThrow({
		where: { username: "demo" },
		select: { id: true },
	});

	const savedCity = await prisma.city.upsert({
		where: { lat_lon: { lat, lon } },
		update: { name, country},
		create: { name: name, lat, lon, state: null, country },
		select: { id: true },
	});

	await prisma.searchHistory.upsert({
		where: {
			userId_cityId: {
				userId: demoUser.id,
				cityId: savedCity.id,
			},
		},
		update: {
			searchedAt: new Date(),
		},
		create: {
			userId: demoUser.id,
			cityId: savedCity.id,
		},
	});

	const current =
		currentSettled.status === "fulfilled"
			? ((await currentSettled.value.json()) as OWCurrentWeatherResponse)
			: null;

	const airPollution = await fetchAirPollution(lat, lon)
		.then((r) => r.json() as Promise<OWAirPollutionResponse>)
		.catch(() => null);

	const response: WeatherResponseDTO = mapToWeatherDTO(
		forecast,
		current,
		airPollution,
	);

	return response;
};

export { getWeatherByCity };
