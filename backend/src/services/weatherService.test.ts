import { vi, describe, expect, it, beforeEach } from "vitest";
import { forecast, currentWeather, airPollution } from "../test/fixtures.js";
import { getWeatherByCity } from "./weatherService.js";
import { mapToWeatherDTO } from "../mappers/weather.mapper.js";
import { mockFetchAll, stubFetch, fetchMock } from "../test/mockFetch.js";

stubFetch();

const city = "Gdansk";

beforeEach(() => {
	fetchMock.mockReset();
});

describe("weatherService", () => {
	it("happy path", async () => {
		mockFetchAll(forecast, currentWeather, airPollution);

		const result = await getWeatherByCity(city);

		expect(result).toStrictEqual(
			mapToWeatherDTO(forecast, currentWeather, airPollution),
		);

		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining(`weather?q=${city}`),
		);
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining(`forecast?q=${city}`),
		);
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining("air_pollution/forecast?lat=52.52"),
		);
	});

	it("forecast is failed", async () => {
		mockFetchAll(null, currentWeather, airPollution);

		await expect(getWeatherByCity(city)).rejects.toThrow("error");
	});

	it("current weather is failed", async () => {
		mockFetchAll(forecast, null, airPollution);

		const result = await getWeatherByCity(city);

		expect(result).toStrictEqual(mapToWeatherDTO(forecast, null, airPollution));
	});

	it("air pollution is failed", async () => {
		mockFetchAll(forecast, currentWeather, null);

		const result = await getWeatherByCity(city);

		expect(result).toStrictEqual(
			mapToWeatherDTO(forecast, currentWeather, null),
		);
	});

	it("air pollution and current weather is failed", async () => {
		mockFetchAll(forecast, null, null);

		const result = await getWeatherByCity(city);

		expect(result).toStrictEqual(mapToWeatherDTO(forecast, null, null));
	});
});
