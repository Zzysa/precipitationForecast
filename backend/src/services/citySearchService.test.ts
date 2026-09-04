import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import type { OWGeocodingResponse } from "../dtos/openWeather.dto.js";
import { fetchMock, stubFetch } from "../test/mockFetch.js";
import { getCitySearchByCityAndCountry } from "./citySearchService.js";

type FavoriteWithCity = Prisma.FavoriteGetPayload<{
	include: { city: true };
}>;

type SearchHistoryWithCity = Prisma.SearchHistoryGetPayload<{
	include: { city: true };
}>;

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

const favoriteCities: FavoriteWithCity[] = [
	{
		id: 1,
		userId: 7,
		cityId: 1,
		createdAt: new Date("2026-09-01T10:00:00.000Z"),
		city: {
			id: 1,
			name: "Gdańsk",
			state: "Pomeranian Voivodeship",
			country: "PL",
			lat: 54.3722,
			lon: 18.6383,
		},
	},
	{
		id: 2,
		userId: 7,
		cityId: 2,
		createdAt: new Date("2026-09-01T09:00:00.000Z"),
		city: {
			id: 2,
			name: "London",
			state: "England",
			country: "GB",
			lat: 51.5074,
			lon: -0.1278,
		},
	},
];

const searchHistoryCities: SearchHistoryWithCity[] = [
	{
		id: 1,
		userId: 7,
		cityId: 1,
		searchedAt: new Date("2026-09-01T11:00:00.000Z"),
		city: {
			id: 1,
			name: "Gdańsk",
			state: "Pomeranian Voivodeship",
			country: "PL",
			lat: 54.3722,
			lon: 18.6383,
		},
	},
	{
		id: 2,
		userId: 7,
		cityId: 3,
		searchedAt: new Date("2026-09-01T08:00:00.000Z"),
		city: {
			id: 3,
			name: "Athens",
			state: "Attica",
			country: "GR",
			lat: 37.9838,
			lon: 23.7275,
		},
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

const expectedMergedCities = [
	{
		cityId: 1,
		name: "Gdańsk",
		state: "Pomeranian Voivodeship",
		country: "PL",
		lat: 54.3722,
		lon: 18.6383,
		isFavorite: true,
		isInSearchHistory: true,
	},
	{
		cityId: 2,
		name: "London",
		state: "England",
		country: "GB",
		lat: 51.5074,
		lon: -0.1278,
		isFavorite: true,
		isInSearchHistory: false,
	},
	{
		cityId: 3,
		name: "Athens",
		state: "Attica",
		country: "GR",
		lat: 37.9838,
		lon: 23.7275,
		isFavorite: false,
		isInSearchHistory: true,
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
		passwordHash: "passwordHash"
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
		expect(prisma.favorite.findMany).toHaveBeenCalledWith({
			where: {
				userId: 7,
				city: {
					is: {
						name: { contains: "Gdansk", mode: "insensitive" },
						country: { equals: "PL", mode: "insensitive" },
					},
				},
			},
			orderBy: { createdAt: "desc" },
			include: { city: true },
			take: 5,
		});
		expect(prisma.searchHistory.findMany).toHaveBeenCalledWith({
			where: {
				userId: 7,
				city: {
					is: {
						name: { contains: "Gdansk", mode: "insensitive" },
						country: { equals: "PL", mode: "insensitive" },
					},
				},
			},
			include: { city: true },
			orderBy: { searchedAt: "desc" },
			take: 10,
		});
		expect(result).toEqual(expectedCities);
	});

	it("searches without country", async () => {
		fetchMock.mockResolvedValueOnce(mockResponse(geocodingResponse));

		await getCitySearchByCityAndCountry("New York", null);

		expect(fetchMock).toHaveBeenCalledWith(
			"https://api.openweathermap.org/geo/1.0/direct?q=New%20York&limit=5&appid=test-key",
		);
		expect(prisma.favorite.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					userId: 7,
					city: {
						is: {
							name: { contains: "New York", mode: "insensitive" },
						},
					},
				},
			}),
		);
	});

	it("throws when geocoding request fails", async () => {
		fetchMock.mockResolvedValueOnce(mockResponse(null, false));

		await expect(getCitySearchByCityAndCountry("Gdansk", "PL")).rejects.toThrow(
			"API error",
		);
	});

	it("merges duplicate cities and combines their flags", async () => {
		vi.mocked(prisma.favorite.findMany).mockResolvedValue(favoriteCities);
		vi.mocked(prisma.searchHistory.findMany).mockResolvedValue(
			searchHistoryCities,
		);
		fetchMock.mockResolvedValueOnce(mockResponse(geocodingResponse));

		const result = await getCitySearchByCityAndCountry("Gdansk", "PL");

		expect(result).toEqual(expectedMergedCities);
	});

	it("keeps cities from different states separate", async () => {
		const springfieldFavorite: FavoriteWithCity = {
			id: 3,
			userId: 7,
			cityId: 4,
			createdAt: new Date("2026-09-01T12:00:00.000Z"),
			city: {
				id: 4,
				name: "Springfield",
				state: "Illinois",
				country: "US",
				lat: 39.7817,
				lon: -89.6501,
			},
		};
		const springfieldGeocodingResponse: OWGeocodingResponse = [
			{
				name: "Springfield",
				state: "Massachusetts",
				country: "US",
				lat: 42.1015,
				lon: -72.5898,
			},
		];
		vi.mocked(prisma.favorite.findMany).mockResolvedValue([
			springfieldFavorite,
		]);
		fetchMock.mockResolvedValueOnce(mockResponse(springfieldGeocodingResponse));

		const result = await getCitySearchByCityAndCountry("Springfield", "US");

		expect(result).toHaveLength(2);
		expect(result.map(({ state }) => state)).toEqual([
			"Illinois",
			"Massachusetts",
		]);
	});

	it("returns no more than ten cities", async () => {
		const manyHistoryCities: SearchHistoryWithCity[] = Array.from(
			{ length: 12 },
			(_, index) => ({
				id: index + 10,
				userId: 7,
				cityId: index + 10,
				searchedAt: new Date(2026, 8, 1, 12, index),
				city: {
					id: index + 10,
					name: `City ${index + 1}`,
					state: null,
					country: "PL",
					lat: 40 + index,
					lon: 20 + index,
				},
			}),
		);
		vi.mocked(prisma.searchHistory.findMany).mockResolvedValue(
			manyHistoryCities,
		);
		fetchMock.mockResolvedValueOnce(mockResponse([]));

		const result = await getCitySearchByCityAndCountry("City", "PL");

		expect(result).toHaveLength(10);
		expect(result[0]?.name).toBe("City 1");
		expect(result[9]?.name).toBe("City 10");
	});
});
