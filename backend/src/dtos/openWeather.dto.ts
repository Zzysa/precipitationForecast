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

export type {
	OWCurrentWeatherResponse,
	OWForecastResponse,
	OWAirPollutionResponse,
};
