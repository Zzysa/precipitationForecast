import type {
	WeatherResponseDTO,
	HourlyForecastPoint,
	CurrentWeather,
	HourlyAirPollutionPoint,
} from "../dtos/weather.dto.js";
import type {
	OWAirPollutionResponse,
	OWCurrentWeatherResponse,
	OWForecastResponse,
} from "../dtos/openWeather.dto.js";

const FORECAST_WINDOW = 24;

const round2 = (num: number) => {
	return Number(num.toFixed(2));
};

const mapToForecast = (forecast: OWForecastResponse): HourlyForecastPoint[] =>
	forecast.list.slice(0, FORECAST_WINDOW).map((point) => ({
		timestamp: point.dt,
		temp: round2(point.main.temp),
		precipitationProbability: round2(point.pop * 100),
	}));

const calculateMaxPrecipChance = (forecast: OWForecastResponse) => {
	if (!forecast.list || forecast.list.length === 0) {
		return null;
	}

	const pops = forecast.list
		.slice(0, FORECAST_WINDOW)
		.map((el) => el.pop)
		.filter((pop): pop is number => typeof pop === "number");

	if (pops.length === 0) {
		return null;
	}
	return round2(Math.max(...pops) * 100);
};

const calculateAvgPrecipChance = (forecast: OWForecastResponse) => {
	if (!forecast.list || forecast.list.length === 0) {
		return null;
	}

	const pops = forecast.list
		.slice(0, FORECAST_WINDOW)
		.map((el) => el.pop)
		.filter((el) => typeof el === "number");

	if (pops.length === 0) {
		return null;
	}

	const sum = pops.reduce((acc, pop) => acc + pop, 0);
	return round2((sum / pops.length) * 100);
};

const mapToAirPollution = (
	airPollution: OWAirPollutionResponse | null,
): HourlyAirPollutionPoint[] | null => {
	if (!airPollution || !airPollution.list || airPollution.list.length === 0) {
		return null;
	}

	return airPollution.list.slice(0, FORECAST_WINDOW).map((point) => ({
		timestamp: point.dt,
		aqi: point.main.aqi,
	}));
};

const calculateAvgAirQuality = (airQuality: OWAirPollutionResponse | null) => {
	if (!airQuality || !airQuality.list || airQuality.list.length === 0) {
		return null;
	}

	const aqis = airQuality.list
		.slice(0, FORECAST_WINDOW)
		.map((el) => el.main.aqi)
		.filter((el) => typeof el === "number");

	if (aqis.length === 0) {
		return null;
	}

	const sum = aqis.reduce((acc, el) => {
		return el + acc;
	}, 0);

	return round2(sum / aqis.length);
};

type DayPeriod = "day" | "night";

const calculateAvgTempByPeriod = (
	weather: OWCurrentWeatherResponse,
	forecast: OWForecastResponse,
	period: DayPeriod,
) => {
	const { sunrise, sunset } = weather.sys;

	const tempHourly = forecast.list
		.slice(0, FORECAST_WINDOW)
		.map((el) => ({ dt: el.dt, temp: el.main.temp }))
		.filter((el) => {
			if (typeof el.dt !== "number" || typeof el.temp !== "number") {
				return false;
			}

			const isDay = el.dt >= sunrise && el.dt < sunset;
			return period === "day" ? isDay : !isDay;
		});

	if (tempHourly.length === 0) {
		return null;
	}

	const sum = tempHourly.reduce((acc, el) => {
		return acc + el.temp;
	}, 0);

	return round2(sum / tempHourly.length);
};

const mapToCurrentWeather = (
	weather: OWCurrentWeatherResponse | null,
	forecast: OWForecastResponse | null,
): CurrentWeather | null => {
	if (!weather || !forecast) {
		return null;
	}

	return {
		tempDay: calculateAvgTempByPeriod(weather, forecast, "day"),
		tempNight: calculateAvgTempByPeriod(weather, forecast, "night"),
		condition:
			weather.weather.length > 0
				? weather.weather.map((item) => item.main)
				: null,
	};
};

const mapToWeatherDTO = (
	forecast: OWForecastResponse,
	weather: OWCurrentWeatherResponse | null,
	airPollutionHourly: OWAirPollutionResponse | null,
): WeatherResponseDTO => ({
	hourlyForecast: mapToForecast(forecast),
	maxPrecipitationChance: calculateMaxPrecipChance(forecast),
	avgPrecipitationChance: calculateAvgPrecipChance(forecast),
	currentWeather: mapToCurrentWeather(weather, forecast),
	avgAirPollution: calculateAvgAirQuality(airPollutionHourly),
	hourlyAirPollution: mapToAirPollution(airPollutionHourly),
});

export {
	mapToWeatherDTO,
	mapToForecast,
	calculateMaxPrecipChance,
	calculateAvgPrecipChance,
	mapToAirPollution,
	calculateAvgAirQuality,
	mapToCurrentWeather,
	calculateAvgTempByPeriod,
};
