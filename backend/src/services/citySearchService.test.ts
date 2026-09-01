import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../db/prisma.js";
import type { OWGeocodingResponse } from "../dtos/openWeather.dto.js";
import { fetchMock, stubFetch } from "../test/mockFetch.js";
import { getCitySearchByCityAndCountry } from "./citySearchService.js";

const geocodingResponse: OWGeocodingResponse = [
	{
		name: "Gdańsk",
		state: "Pomeranian Voivodeship",
		country: "PL",
		lat: 54.3722,
		lon: 18.6383,
	},
	{
		name: "Gdansk",
		country: "US",
		lat: 42.9184,
		lon: -88.2154,
	},
];

const expectedCities = [
	{
		cityId: null,
		name: "Gdańsk",
		state: "Pomeranian Voivodeship",
		country: "PL",
		lat: 54.3722,
		lon: 18.6383,
		isFavorite: false,
		isInSearchHistory: false,
	},
	{
		cityId: null,
		name: "Gdansk",
		state: null,
		country: "US",
		lat: 42.9184,
		lon: -88.2154,
		isFavorite: false,
		isInSearchHistory: false,
	},
];

const mockResponse = (data: unknown, ok = true) => ({
	ok,
	json: vi.fn().mockResolvedValue(data),
	text: vi.fn().mockResolvedValue("API error"),
});

vi.mock("../db/prisma.js", () => ({
	prisma: {
		user: {
			findUniqueOrThrow: vi.fn(),
		},
		favorite: {
			findMany: vi.fn(),
		},
		searchHistory: {
			findMany: vi.fn(),
		},
	},
}));

stubFetch();

beforeEach(() => {
	vi.clearAllMocks();
	fetchMock.mockReset();
	vi.stubEnv("WEATHER_API_KEY", "test-key");
	vi.mocked(prisma.user.findUniqueOrThrow).mockResolvedValue({
		id: 7,
		username: "demo",
	});
	vi.mocked(prisma.favorite.findMany).mockResolvedValue([]);
	vi.mocked(prisma.searchHistory.findMany).mockResolvedValue([]);
});

afterAll(() => {
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
});

describe("getCitySearchByCityAndCountry", () => {
	it("returns mapped geocoding results", async () => {
		fetchMock.mockResolvedValueOnce(mockResponse(geocodingResponse));

		const result = await getCitySearchByCityAndCountry("Gdansk", "PL");

		expect(fetchMock).toHaveBeenCalledWith(
			"https://api.openweathermap.org/geo/1.0/direct?q=Gdansk%2CPL&limit=5&appid=test-key",
		);
		expect(result).toEqual(expectedCities);
	});

	it("searches without country", async () => {
		fetchMock.mockResolvedValueOnce(mockResponse(geocodingResponse));

		await getCitySearchByCityAndCountry("New York", null);

		expect(fetchMock).toHaveBeenCalledWith(
			"https://api.openweathermap.org/geo/1.0/direct?q=New%20York&limit=5&appid=test-key",
		);
	});

	it("throws when geocoding request fails", async () => {
		fetchMock.mockResolvedValueOnce(mockResponse(null, false));

		await expect(
			getCitySearchByCityAndCountry("Gdansk", "PL"),
		).rejects.toThrow("API error");
	});
});
