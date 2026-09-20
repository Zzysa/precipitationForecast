interface HourlyForecastPoint {
	timestamp: number;
	temp: number;
	precipitationProbability: number;
	condition?: string;
	weatherIcon?: string;
}

interface HourlyAirPollutionPoint {
	timestamp: number;
	aqi: number;
}

interface CurrentWeather {
	temp: number | null;
	humidity: number | null;
	tempDay: number | null;
	tempNight: number | null;
	condition: string[] | null;
}

interface WeatherResponseDTO {
	fetchedAt?: number;
	timezoneOffset?: number;
	hourlyForecast: HourlyForecastPoint[];
	maxPrecipitationChance: number | null;
	avgPrecipitationChance: number | null;
	currentWeather: CurrentWeather | null;
	avgAirPollution: number | null;
	hourlyAirPollution: HourlyAirPollutionPoint[] | null;
}

export type {
	WeatherResponseDTO,
	HourlyForecastPoint,
	CurrentWeather,
	HourlyAirPollutionPoint,
};
