interface HourlyForecastPoint {
	timestamp: number;
	temp: number;
	precipitationProbability: number;
}

interface HourlyAirPollutionPoint {
	timestamp: number;
	aqi: number;
}

interface CurrentWeather {
	tempDay: number | null;
	tempNight: number | null;
	condition: string[] | null;
}

interface WeatherResponseDTO {
	hourlyForecast: HourlyForecastPoint[];
	maxPrecipitationChance: number | null;
	avgPrecipitationChance: number | null;
	currentWeather: CurrentWeather | null;
	avgAirPollution: number | null;
	hourlyAirPollution: HourlyAirPollutionPoint[] | null;
}

interface CitySearchResultDTO {
	name: string;
	state: string | null;
	country: string;
	lat: number;
	lon: number;
}

export type {
	WeatherResponseDTO,
	HourlyForecastPoint,
	CurrentWeather,
	HourlyAirPollutionPoint,
	CitySearchResultDTO,
};
