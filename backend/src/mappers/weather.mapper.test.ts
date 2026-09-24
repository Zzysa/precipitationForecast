import { it, describe, expect } from "vitest";
import {
	mapToForecast,
	calculateMaxPrecipChance,
	calculateAvgPrecipChance,
	mapToAirPollution,
	calculateAvgAirQuality,
	mapToCurrentWeather,
	mapToWeatherDTO,
	calculateAvgTempByPeriod,
} from "./weather.mapper.js";
import { forecast, currentWeather, airPollution } from "../test/fixtures.js";
import type { OWForecastResponse } from "../dtos/openWeather.dto.js";

const emptyListForecast: OWForecastResponse = {
	city: { name: "Gdansk", country: "PL", coord: { lat: 0, lon: 0 } },
	list: [],
};

const listForecast24Elements: OWForecastResponse = {
	city: { name: "Gdansk", country: "PL", coord: { lat: 0, lon: 0 } },
	list: Array.from({ length: 30 }, (_, i) => ({
		dt: 1710000000 + i,
		main: { temp: i },
		pop: i / 100,
	})),
};

const emptyAirPollution = { list: [] };

const airPollution30Elements = {
	list: Array.from({ length: 30 }, (_, i) => ({
		dt: 1710000000 + i,
		main: { aqi: i },
	})),
};

describe("mapToForecast", () => {
	const expected = [
		{ timestamp: 1710000000, temp: 12.33, precipitationProbability: 45.6 },
		{ timestamp: 1710003600, temp: 10, precipitationProbability: 0 },
		{ timestamp: 1710007200, temp: -1.5, precipitationProbability: 100 },
	];

	it("map data correctly", () => {
		expect(mapToForecast(forecast)).toStrictEqual(expected);
	});

	it("returns empty array when list is empty", () => {
		expect(mapToForecast(emptyListForecast)).toEqual([]);
	});

	it("keeps only first 24 points", () => {
		const result = mapToForecast(listForecast24Elements);

		expect(result).toHaveLength(24);
		expect(result[0]?.timestamp).toBe(1710000000);
		expect(result[23]?.timestamp).toBe(1710000023);
	});
});

describe("calculateMaxPrecipChance", () => {
	it("return null if an array list is empty", () => {
		expect(calculateMaxPrecipChance(emptyListForecast)).toBe(null);
	});

	it("calculate max precipitation chance correctly among sliced 24 elements", () => {
		expect(calculateMaxPrecipChance(listForecast24Elements)).toBe(23);
	});
});

describe("calculateAvgPrecipChance", () => {
	it("return null if an array list is empty", () => {
		expect(calculateAvgPrecipChance(emptyListForecast)).toBe(null);
	});

	it("calculate avg precipitation chance correctly among sliced 24 elements", () => {
		expect(calculateAvgPrecipChance(listForecast24Elements)).toBe(11.5);
	});
});

describe("mapToAirPollution", () => {
	it("returns null when air pollution is null", () => {
		expect(mapToAirPollution(null)).toBe(null);
	});

	it("returns null when list is empty", () => {
		expect(mapToAirPollution(emptyAirPollution)).toBe(null);
	});

	it("maps air pollution points correctly", () => {
		expect(mapToAirPollution(airPollution)).toStrictEqual([
			{ timestamp: 1710000000, aqi: 2 },
			{ timestamp: 1710003600, aqi: 4 },
		]);
	});

	it("keeps only first 24 points", () => {
		const result = mapToAirPollution(airPollution30Elements);

		expect(result).toHaveLength(24);
		expect(result?.[0]?.timestamp).toBe(1710000000);
		expect(result?.[23]?.timestamp).toBe(1710000023);
	});
});

describe("calculateAvgAirQuality", () => {
	it("returns null when air pollution is null", () => {
		expect(calculateAvgAirQuality(null)).toBe(null);
	});

	it("returns null when list is empty", () => {
		expect(calculateAvgAirQuality(emptyAirPollution)).toBe(null);
	});

	it("calculates average aqi correctly", () => {
		expect(calculateAvgAirQuality(airPollution)).toBe(3);
	});

	it("calculates average aqi among sliced 24 elements", () => {
		expect(calculateAvgAirQuality(airPollution30Elements)).toBe(11.5);
	});
});

describe("mapToCurrentWeather", () => {
	it("keeps tomorrow's daytime separate from night and limits averages to 24 hours", () => {
		const start = 1710000000;
		const data = { ...forecast, list: [
			{ dt: start, main: { temp: 8 }, pop: 0, weather: [{ main: "Clear", icon: "01n" }] },
			{ dt: start + 12 * 3600, main: { temp: 20 }, pop: 0, weather: [{ main: "Clear", icon: "01d" }] },
			{ dt: start + 24 * 3600, main: { temp: 100 }, pop: 0, weather: [{ main: "Clear", icon: "01d" }] },
		] };
		expect(calculateAvgTempByPeriod(currentWeather, data, "day")).toBe(20);
		expect(calculateAvgTempByPeriod(currentWeather, data, "night")).toBe(8);
	});

	it("ignores invalid temperatures and returns null for a missing period", () => {
		const data = { ...forecast, list: [
			{ dt: 1710000000, main: { temp: NaN }, pop: 0, weather: [{ main: "Clear", icon: "01d" }] },
			{ dt: 1710003600, main: { temp: -5 }, pop: 0, weather: [{ main: "Clear", icon: "01n" }] },
		] };
		expect(calculateAvgTempByPeriod(currentWeather, data, "day")).toBeNull();
		expect(calculateAvgTempByPeriod(currentWeather, data, "night")).toBe(-5);
	});

	it("uses the solar window on the next day when forecast icons are missing", () => {
		const data = { ...forecast, list: [
			{ dt: 1710000024, main: { temp: 8 }, pop: 0 },
			{ dt: 1710000010 + 86400, main: { temp: 20 }, pop: 0 },
		] };
		expect(calculateAvgTempByPeriod(currentWeather, data, "day")).toBe(20);
		expect(calculateAvgTempByPeriod(currentWeather, data, "night")).toBe(8);
	});
	it("returns null when weather is null", () => {
		expect(mapToCurrentWeather(null, forecast)).toBe(null);
	});

	it("returns null when forecast is null", () => {
		expect(mapToCurrentWeather(currentWeather, null)).toBe(null);
	});

	it("maps weather conditions", () => {
		const result = mapToCurrentWeather(currentWeather, forecast);

		expect(result?.condition).toStrictEqual(["Clouds", "Rain"]);
	});

	it("returns null condition when weather array is empty", () => {
		const weatherWithoutConditions = {
			...currentWeather,
			weather: [],
		};

		const result = mapToCurrentWeather(weatherWithoutConditions, forecast);

		expect(result?.condition).toBe(null);
	});

	it("calculates tempDay by sunrise/sunset", () => {
		expect(
			calculateAvgTempByPeriod(currentWeather, listForecast24Elements, "day"),
		).toBe(14.5);
	});

	it("calculates tempNight by sunrise/sunset", () => {
		expect(
			calculateAvgTempByPeriod(currentWeather, listForecast24Elements, "night"),
		).toBe(5.5);
	});
});

describe("mapToWeatherDTO", () => {
	it("assembles dto from forecast, weather and air pollution", () => {
		const result = mapToWeatherDTO(forecast, currentWeather, airPollution);

		expect(result.hourlyForecast).toHaveLength(3);
		expect(result.maxPrecipitationChance).toBe(100);
		expect(result.avgPrecipitationChance).toBe(48.53);
		expect(result.avgAirPollution).toBe(3);
		expect(result.hourlyAirPollution).toHaveLength(2);
		expect(result.currentWeather?.condition).toStrictEqual(["Clouds", "Rain"]);
	});

	it("allows null weather and air pollution", () => {
		const result = mapToWeatherDTO(forecast, null, null);

		expect(result.currentWeather).toBe(null);
		expect(result.avgAirPollution).toBe(null);
		expect(result.hourlyAirPollution).toBe(null);
		expect(result.hourlyForecast).toHaveLength(3);
	});
});
