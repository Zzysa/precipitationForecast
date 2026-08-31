import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
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
		name: "Gdańsk",
		state: "Pomeranian Voivodeship",
		country: "PL",
		lat: 54.3722,
		lon: 18.6383,
	},
	{
		name: "Gdansk",
		state: null,
		country: "US",
		lat: 42.9184,
		lon: -88.2154,
	},
];

const mockResponse = (data: unknown, ok = true) => ({
	ok,
	json: vi.fn().mockResolvedValue(data),
	text: vi.fn().mockResolvedValue("API error"),
});

stubFetch();

beforeEach(() => {
	fetchMock.mockReset();
	vi.stubEnv("WEATHER_API_KEY", "test-key");
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
