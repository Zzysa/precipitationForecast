import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { prisma } from "../../db/prisma.js";
import type { OWGeocodingResponse } from "../../dtos/openWeather.dto.js";
import { app } from "../../server.js";
import { fetchMock, stubFetch } from "../mockFetch.js";

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

const mockResponse = (data: unknown, ok = true) => ({
	ok,
	json: vi.fn().mockResolvedValue(data),
	text: vi.fn().mockResolvedValue("API error"),
});

stubFetch();

beforeEach(async () => {
	fetchMock.mockReset();
	await prisma.favorite.deleteMany();
	await prisma.searchHistory.deleteMany();
	await prisma.city.deleteMany();
	await prisma.user.upsert({
		where: { username: "demo" },
		update: {},
		create: { username: "demo" },
	});
});

afterAll(async () => {
	await prisma.$disconnect();
});

describe("GET /api/city-search", () => {
	it("returns mapped cities from OpenWeather", async () => {
		fetchMock.mockResolvedValueOnce(mockResponse(geocodingResponse));

		const res = await request(app)
			.get("/api/city-search")
			.query({ city: "Gdansk", country: "PL" });

		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			cities: [
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
			],
		});
	});

	it("returns 400 for an empty city", async () => {
		const res = await request(app)
			.get("/api/city-search")
			.query({ city: "   " });

		expect(res.status).toBe(400);
		expect(res.body.error[0].message).toBe("City name cannot be empty");
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("returns 500 when OpenWeather request fails", async () => {
		fetchMock.mockResolvedValueOnce(mockResponse(null, false));

		const res = await request(app)
			.get("/api/city-search")
			.query({ city: "Gdansk", country: "PL" });

		expect(res.status).toBe(500);
		expect(res.body).toEqual({ error: "API error" });
	});
});
