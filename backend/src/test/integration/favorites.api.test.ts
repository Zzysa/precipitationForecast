import { beforeEach, expect, describe, it, afterAll } from "vitest";
import { prisma } from "../../db/prisma.js";
import { app } from "../../server.js";
import request from "supertest";

beforeEach(async () => {
	await prisma.favorite.deleteMany();
	await prisma.searchHistory.deleteMany();
	await prisma.city.deleteMany();
	await prisma.user.upsert({
		where: { username: "demo" },
		update: {},
		create: { username: "demo" },
	});
});

const city = {
	name: "Gdansk",
	state: null,
	country: "PL",
	lat: 54.352,
	lon: 18.6466,
};

afterAll(async () => {
	await prisma.$disconnect();
});

describe("POST /api/favorites", () => {
	it("create city and favorite", async () => {
		const res = await request(app).post("/api/favorites").send(city);

		expect(res.status).toBe(201);

		const savedCity = await prisma.city.findUnique({
			where: { lat_lon: { lat: city.lat, lon: city.lon } },
		});
		expect(savedCity).toMatchObject(city);

		const favorite = await prisma.favorite.count();
		expect(favorite).toBe(1);
	});

	it("does not duplicate on second post", async () => {
		await request(app).post("/api/favorites").send(city);
		await request(app).post("/api/favorites").send(city);

		expect(await prisma.city.count()).toBe(1);
		expect(await prisma.favorite.count()).toBe(1);
	});

	it("returns 400 for invalid body", async () => {
		const res = await request(app).post("/api/favorites").send({});
		expect(res.status).toBe(400);
		expect(res.body.error).toEqual(expect.any(Array));
	});
});
