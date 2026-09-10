import { it, expect, describe, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../server.js";
import { mapToWeatherDTO } from "../../mappers/weather.mapper.js";
import { airPollution, currentWeather, forecast } from "../fixtures.js";
import { fetchMock, mockFetchAll, stubFetch } from "../mockFetch.js";
import { prisma } from "../../db/prisma.js";
import * as argon2 from "argon2";
import { getAccessToken } from "../auth.js";

const passwordHash = await argon2.hash("test-password-123");

stubFetch();

beforeEach(async () => {
	fetchMock.mockReset();
	await prisma.favorite.deleteMany();
	await prisma.searchHistory.deleteMany();
	await prisma.city.deleteMany();
	await prisma.user.upsert({
		where: { username: "demo" },
		update: { passwordHash },
		create: { username: "demo", passwordHash },
	});
});

afterAll(async () => {
	await prisma.$disconnect();
});

const authHeader = async () => ({
	Authorization: `Bearer ${await getAccessToken("demo")}`,
});

describe("/api/weather/:city", () => {
	it("returns weather for a valid city", async () => {
		mockFetchAll(forecast, currentWeather, airPollution);

		const res = await request(app).get("/api/weather/Gdansk");

		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			city: mapToWeatherDTO(forecast, currentWeather, airPollution),
		});
	});

	it("returns 400 for an empty city", async () => {
		const res = await request(app).get("/api/weather/%20%20");

		expect(res.status).toBe(400);
		expect(res.body.error[0].message).toBe("City name cannot be empty");
	});

	it("returns 500 when forecast is unavailable", async () => {
		mockFetchAll(null, null, null);

		const res = await request(app).get("/api/weather/Gdansk");

		expect(res.status).toBe(500);
		expect(res.body).toEqual({ error: "error" });
	});

	it("does not persist city or history for a guest", async () => {
		mockFetchAll(forecast, null, null);

		await request(app).get("/api/weather/Gdansk");

		expect(await prisma.city.count()).toBe(0);
		expect(await prisma.searchHistory.count()).toBe(0);
	});

	it("persists a city after a successful forecast for an authenticated user", async () => {
		mockFetchAll(forecast, null, null);

		await request(app)
			.get("/api/weather/Gdansk")
			.set(await authHeader());

		const savedCity = await prisma.city.findUnique({
			where: { lat_lon: { lat: 52.52, lon: 13.41 } },
		});

		expect(savedCity).toMatchObject({
			name: "Gdansk",
			country: "PL",
			lat: 52.52,
			lon: 13.41,
		});
	});

	it("does not duplicate an existing city", async () => {
		mockFetchAll(forecast, null, null);

		await request(app)
			.get("/api/weather/Gdansk")
			.set(await authHeader());
		await request(app)
			.get("/api/weather/Gdansk")
			.set(await authHeader());

		const count = await prisma.city.count({
			where: { lat: 52.52, lon: 13.41 },
		});

		expect(count).toBe(1);
	});

	it("does not persist a city when forecast fails", async () => {
		mockFetchAll(null, null, null);

		await request(app)
			.get("/api/weather/Gdansk")
			.set(await authHeader());

		const count = await prisma.city.count({
			where: { lat: 52.52, lon: 13.41 },
		});

		expect(count).toBe(0);
	});

	it("persists a search city row after a successful forecast", async () => {
		mockFetchAll(forecast, null, null);

		await request(app)
			.get("/api/weather/Gdansk")
			.set(await authHeader());

		const demoUser = await prisma.user.findUniqueOrThrow({
			where: { username: "demo" },
		});
		const savedCity = await prisma.city.findUniqueOrThrow({
			where: { lat_lon: { lat: 52.52, lon: 13.41 } },
		});

		const row = await prisma.searchHistory.findUnique({
			where: { userId_cityId: { userId: demoUser.id, cityId: savedCity.id } },
		});

		expect(row).toMatchObject({
			cityId: savedCity.id,
			userId: demoUser.id,
			searchedAt: expect.any(Date),
		});
	});

	it("change searched time for searchHistory while second call", async () => {
		mockFetchAll(forecast, null, null);

		await request(app)
			.get("/api/weather/Gdansk")
			.set(await authHeader());

		const demoUser = await prisma.user.findUniqueOrThrow({
			where: { username: "demo" },
		});
		const savedCity = await prisma.city.findUniqueOrThrow({
			where: { lat_lon: { lat: 52.52, lon: 13.41 } },
		});

		const firstSearchedTimeRes = await prisma.searchHistory.findUnique({
			where: {
				userId_cityId: {
					userId: demoUser.id,
					cityId: savedCity.id,
				},
			},
		});

		const firstSearchedTime = firstSearchedTimeRes?.searchedAt;

		await request(app)
			.get("/api/weather/Gdansk")
			.set(await authHeader());

		const secondSearchedTimeRes = await prisma.searchHistory.findUnique({
			where: {
				userId_cityId: {
					userId: demoUser.id,
					cityId: savedCity.id,
				},
			},
		});

		const secondSearchedTime = secondSearchedTimeRes?.searchedAt;

		const count = await prisma.searchHistory.count();
		expect(count).toBe(1);
		expect(secondSearchedTime?.getTime()).not.toBe(
			firstSearchedTime?.getTime(),
		);
	});

	it("does not persist a searchHistory row when forecast fails", async () => {
		mockFetchAll(null, null, null);

		await request(app)
			.get("/api/weather/Gdansk")
			.set(await authHeader());

		const count = await prisma.searchHistory.count();

		expect(count).toBe(0);
	});
});
