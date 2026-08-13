const forecast = {
	city: {
		coord: { lat: 52.52, lon: 13.41 },
	},
	list: [
		{ dt: 1710000000, main: { temp: 12.333334 }, pop: 0.456 },
		{ dt: 1710003600, main: { temp: 10 }, pop: 0 },
		{ dt: 1710007200, main: { temp: -1.5 }, pop: 1 },
	],
};

const airPollution = {
	list: [
		{ dt: 1710000000, main: { aqi: 2 } },
		{ dt: 1710003600, main: { aqi: 4 } },
	],
};

const currentWeather = {
	main: { temp: 11 },
	weather: [{ main: "Clouds" }, { main: "Rain" }],
	sys: {
		sunrise: 1710000007,
		sunset: 1710000023,
	},
};

export { forecast, airPollution, currentWeather };
