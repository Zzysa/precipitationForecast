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

describe("DELETE /api/favorites/:cityId", () => {
	it("deletes a favorite row by city id", async () => {
		const demoUser = await prisma.user.findUniqueOrThrow({
			where: { username: "demo" },
		});

		const savedCity = await prisma.city.create({
			data: {
				name: "Gdansk",
				country: "PL",
				lat: 52.52,
				lon: 13.41,
			},
		});

		await prisma.favorite.create({
			data: {
				userId: demoUser.id,
				cityId: savedCity.id,
			},
		});

		const res = await request(app).delete(`/api/favorites/${savedCity.id}`);

		const count = await prisma.favorite.count({
			where: {
				cityId: savedCity.id,
				userId: demoUser.id,
			},
		});

		expect(res.status).toBe(204);
		expect(res.body).toStrictEqual({});
		expect(count).toBe(0);
	});

	it("returns 204 when favorite does not exist", async () => {
		const res = await request(app).delete("/api/favorites/999");

		expect(res.status).toBe(204);
		expect(res.body).toStrictEqual({});
	});

	it("returns 400 error if city id is invalid", async () => {
		const res = await request(app).delete("/api/favorites/abc");

		expect(res.status).toBe(400);
		expect(res.body.error[0].message).toBe("City id must be a number");
	});
});

describe("GET /api/favorites", () => {
	it("returns favorite cites for a demo user", async () => {
		const demoUser = await prisma.user.findUniqueOrThrow({
			where: { username: "demo" },
		});

		const savedCity = await prisma.city.create({
			data: {
				name: "Gdansk",
				country: "PL",
				lat: 52.52,
				lon: 13.41,
			},
		});

		const savedCity2 = await prisma.city.create({
			data: {
				name: "London",
				country: "EN",
				lat: 55.52,
				lon: 20.41,
			},
		});

		await prisma.favorite.create({
			data: {
				userId: demoUser.id,
				cityId: savedCity.id,
			},
		});

		await prisma.favorite.create({
			data: {
				userId: demoUser.id,
				cityId: savedCity2.id,
			},
		});

		const res = await request(app).get("/api/favorites");

		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			favorites: [
				{
					id: expect.any(Number),
					userId: demoUser.id,
					cityId: savedCity2.id,
					createdAt: expect.any(String),
					city: {
						id: savedCity2.id,
						name: "London",
						state: null,
						country: "EN",
						lat: 55.52,
						lon: 20.41,
					},
				},
				{
					id: expect.any(Number),
					userId: demoUser.id,
					cityId: savedCity.id,
					createdAt: expect.any(String),
					city: {
						id: savedCity.id,
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

	it("returns nothing if no favorites", async () => {
		await prisma.user.findUniqueOrThrow({
			where: { username: "demo" },
		});

		const res = await request(app).get("/api/favorites");

		expect(res.status).toBe(200);
		expect(res.body).toEqual({ favorites: [] });
	});
});
