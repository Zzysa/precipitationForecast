import { it, expect, describe, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../server.js";
import { prisma } from "../../db/prisma.js";

beforeEach(async () => {
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
				country: "PL",
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
						state: null,
						country: "PL",
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

describe("DELETE /api/search-history/:cityId", () => {
	it("deletes a search history row by city id", async () => {
		const demoUser = await prisma.user.findUniqueOrThrow({
			where: { username: "demo" },
		});

		const city = await prisma.city.create({
			data: {
				name: "Gdansk",
				country: "PL",
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

		const res = await request(app).delete(
			`/api/search-history/${city.id}`,
		);

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

	it("returns 400 error if city id is invalid", async () => {
		const res = await request(app).delete("/api/search-history/abc");

		expect(res.status).toBe(400);
		expect(res.body.error[0].message).toBe("City id must be a number");
	});
});
