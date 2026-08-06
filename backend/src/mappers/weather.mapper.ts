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

const mapToForecast = (forecast: OWForecastResponse): HourlyForecastPoint[] =>
	forecast.list.map((point) => ({
		timestamp: point.dt,
		temp: point.main.temp,
		precipitationProbability: point.pop * 100,
	}));

const calculateMaxPrecipChance = (forecast: OWForecastResponse) => {
	if (!forecast || !forecast.list || forecast.list.length === 0) {
		return null;
	}

	const pops = forecast.list
		.map((el) => el.pop)
		.filter((pop): pop is number => typeof pop === "number");

	if (pops.length === 0) {
		return null;
	}
	return Math.max(...pops) * 100;
};

const calculateAvgPrecipChance = (forecast: OWForecastResponse) => {
	if (!forecast || !forecast.list || forecast.list.length === 0) {
		return null;
	}

	const pops = forecast.list
		.map((el) => el.pop)
		.filter((el) => typeof el === "number");

	if (pops.length === 0) {
		return null;
	}

	const sum = pops.reduce((acc, pop) => acc + pop, 0);
	return (sum / pops.length) * 100;
};

const mapToAirPollution = (
	airPollution: OWAirPollutionResponse | null,
): HourlyAirPollutionPoint[] | null => {
	if (!airPollution || !airPollution.list || airPollution.list.length === 0) {
		return null;
	}

	return airPollution.list.map((point) => ({
		timestamp: point.dt,
		aqi: point.main.aqi,
	}));
};

const calculateAvgAirQuality = (airQuality: OWAirPollutionResponse | null) => {
	if (!airQuality || !airQuality.list || airQuality.list.length === 0) {
		return null;
	}

	const aqis = airQuality.list
		.map((el) => el.main.aqi)
		.filter((el) => typeof el === "number");

	if (aqis.length === 0) {
		return null;
	}

	const sum = aqis.reduce((acc, el) => {
		return el + acc;
	}, 0);

	return sum / aqis.length;
};

const calculateTempDay = (
	weather: OWCurrentWeatherResponse,
	forecast: OWForecastResponse,
) => {
	const dtSunrise = weather.sys.sunrise;
	const dtSunset = weather.sys.sunset;

	const tempHourly = forecast.list
		.slice(0, 25)
		.map((el) => ({ dt: el.dt, temp: el.main.temp }))
		.filter(
			(el) =>
				typeof el.dt === "number" &&
				typeof el.temp === "number" &&
				el.dt >= dtSunrise &&
				el.dt < dtSunset,
		);

	if (tempHourly.length === 0) {
		return null;
	}

	const sum = tempHourly.reduce((acc, el) => {
		return acc + el.temp;
	}, 0);

	return sum / tempHourly.length;
};

const calculateTempNight = (
	weather: OWCurrentWeatherResponse,
	forecast: OWForecastResponse,
) => {
	const dtSunrise = weather.sys.sunrise;
	const dtSunset = weather.sys.sunset;

	const tempHourly = forecast.list
		.slice(0, 25)
		.map((el) => ({ dt: el.dt, temp: el.main.temp }))
		.filter(
			(el) =>
				typeof el.dt === "number" &&
				typeof el.temp === "number" &&
				el.dt < dtSunrise || el.dt >= dtSunset,
		);

	if (tempHourly.length === 0) {
		return null;
	}

	const sum = tempHourly.reduce((acc, el) => {
		return acc + el.temp;
	}, 0);

	return sum / tempHourly.length;
};

const mapToCurrentWeather = (
	weather: OWCurrentWeatherResponse | null,
	forecast: OWForecastResponse | null,
): CurrentWeather | null => {
	if (!weather || !forecast) {
		return null;
	}

	return {
		tempDay: calculateTempDay(weather, forecast),
		tempNight: calculateTempNight(weather, forecast),
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

export { mapToWeatherDTO };
