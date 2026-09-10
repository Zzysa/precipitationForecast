import { vi, describe, expect, it, beforeEach } from "vitest";
import { forecast, currentWeather, airPollution } from "../test/fixtures.js";
import { getWeatherByCity } from "./weatherService.js";
import { mapToWeatherDTO } from "../mappers/weather.mapper.js";
import { mockFetchAll, stubFetch, fetchMock } from "../test/mockFetch.js";
import { prisma } from "../db/prisma.js";

stubFetch();

vi.mock("../db/prisma.js", () => ({
	prisma: {
		city: {
			upsert: vi.fn(),
		},
		searchHistory: {
			upsert: vi.fn(),
		},
	},
}));

const city = "Gdansk";
const userId = 1;

beforeEach(() => {
	fetchMock.mockReset();
	vi.mocked(prisma.city.upsert).mockReset();
	vi.mocked(prisma.searchHistory.upsert).mockReset();

	vi.mocked(prisma.city.upsert).mockResolvedValue({
		id: 1,
		name: city,
		state: null,
		country: "PL",
		lat: 52.52,
		lon: 13.41,
	});
	vi.mocked(prisma.searchHistory.upsert).mockResolvedValue({
		id: 1,
		userId,
		cityId: 1,
		searchedAt: new Date(),
	});
});

describe("weatherService", () => {
	it("happy path", async () => {
		mockFetchAll(forecast, currentWeather, airPollution);

		const result = await getWeatherByCity(city, null);

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

		await expect(getWeatherByCity(city, userId)).rejects.toThrow("error");
	});

	it("current weather is failed", async () => {
		mockFetchAll(forecast, null, airPollution);

		const result = await getWeatherByCity(city, null);

		expect(result).toStrictEqual(mapToWeatherDTO(forecast, null, airPollution));
	});

	it("air pollution is failed", async () => {
		mockFetchAll(forecast, currentWeather, null);

		const result = await getWeatherByCity(city, null);

		expect(result).toStrictEqual(
			mapToWeatherDTO(forecast, currentWeather, null),
		);
	});

	it("air pollution and current weather is failed", async () => {
		mockFetchAll(forecast, null, null);

		const result = await getWeatherByCity(city, null);

		expect(result).toStrictEqual(mapToWeatherDTO(forecast, null, null));
	});

	it("adds to search history when forecast is fetched for a user", async () => {
		mockFetchAll(forecast, null, null);

		await getWeatherByCity(city, userId);

		expect(prisma.searchHistory.upsert).toHaveBeenCalledWith({
			where: {
				userId_cityId: {
					userId,
					cityId: 1,
				},
			},
			update: {
				searchedAt: expect.any(Date),
			},
			create: {
				userId,
				cityId: 1,
			},
		});
	});

	it("adds city when forecast is fetched for a user", async () => {
		mockFetchAll(forecast, null, null);

		await getWeatherByCity(city, userId);

		expect(prisma.city.upsert).toHaveBeenCalledWith({
			where: {
				lat_lon: {
					lat: 52.52,
					lon: 13.41,
				},
			},
			update: {
				name: city,
				country: "PL",
			},
			create: {
				name: city,
				lat: 52.52,
				lon: 13.41,
				state: null,
				country: "PL",
			},
			select: { id: true },
		});
	});

	it("does not persist city or search history for a guest", async () => {
		mockFetchAll(forecast, null, null);

		await getWeatherByCity(city, null);

		expect(prisma.city.upsert).not.toHaveBeenCalled();
		expect(prisma.searchHistory.upsert).not.toHaveBeenCalled();
	});

	it("do not call city and search history upsert when forecast is failed", async () => {
		mockFetchAll(null, null, null);

		await expect(getWeatherByCity(city, userId)).rejects.toThrow("error");

		expect(prisma.city.upsert).not.toHaveBeenCalled();
		expect(prisma.searchHistory.upsert).not.toHaveBeenCalled();
	});
});
