import { it, expect, describe, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../server.js";
import { fetchMock } from "../mockFetch.js";
import { prisma } from "../../db/prisma.js";

beforeEach(async () => {
	fetchMock.mockReset();
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

describe("GET /api/search-history", () => {
	it("returns demouser's search history", async () => {
		const demoUser = await prisma.user.findUniqueOrThrow({
			where: { username: "demo" },
		});

		const city = await prisma.city.create({
			data: {
				name: "Gdansk",
				lat: 52.52,
				lon: 13.41,
			},
		});

		await prisma.searchHistory.create({
			data: {
				userId: demoUser.id,
				cityId: city.id,
			},
		});

		const searchRes = await request(app).get("/api/search-history");

		expect(searchRes.status).toBe(200);
		expect(searchRes.body).toEqual({
			history: [
				{
					id: expect.any(Number),
					userId: demoUser.id,
					cityId: city.id,
					searchedAt: expect.any(String),
					city: {
						id: city.id,
						name: "Gdansk",
						lat: 52.52,
						lon: 13.41,
					},
				},
			],
		});
	});

	it("returns an empty history", async () => {
		const res = await request(app).get("/api/search-history");
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ history: [] });
	});
});

describe("DELETE /api/search-history/:city", () => {
	it("delete a search history row by city name", async () => {
		const demoUser = await prisma.user.findUniqueOrThrow({
			where: { username: "demo" },
		});

		const city = await prisma.city.create({
			data: {
				name: "Gdansk",
				lat: 52.52,
				lon: 13.41,
			},
		});

		await prisma.searchHistory.create({
			data: {
				userId: demoUser.id,
				cityId: city.id,
			},
		});

		const res = await request(app).delete("/api/search-history/Gdansk");

		const count = await prisma.searchHistory.count({
			where: {
				cityId: city.id,
				userId: demoUser.id,
			},
		});

		expect(res.status).toBe(204);
		expect(res.body).toStrictEqual({});
		expect(count).toBe(0);
	});

	it("returns 400 error if city is empty", async () => {
		const res = await request(app).delete("/api/search-history/%20%20");

		expect(res.body.error[0].message).toBe("City name cannot be empty");
		expect(res.status).toBe(400);
	});
});
