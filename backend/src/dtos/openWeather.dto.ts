interface OWCurrentWeatherResponse {
	main: {
		temp: number;
	};
	weather: {
		main: string;
	}[];
	sys: {
		sunrise: number;
		sunset: number;
	};
}

interface OWForecastHourly {
	dt: number;
	main: {
		temp: number;
	};
	pop: number;
}

interface OWForecastResponse {
	list: OWForecastHourly[];
	city: {
		name: string;
		country: string;
		coord: {
			lat: number;
			lon: number;
		};
	};
}

interface OWAirPollutionHourly {
	dt: number;
	main: {
		aqi: number;
	};
}

interface OWAirPollutionResponse {
	list: OWAirPollutionHourly[];
}

interface OWGeocodingCity {
	name: string;
	lat: number;
	lon: number;
	country: string;
	state?: string;
}

type OWGeocodingResponse = OWGeocodingCity[]

export type {
	OWCurrentWeatherResponse,
	OWForecastResponse,
	OWAirPollutionResponse,
	OWGeocodingResponse,
};
