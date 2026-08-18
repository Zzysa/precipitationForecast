import { it, expect, describe, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../server.js";
import { mapToWeatherDTO } from "../../mappers/weather.mapper.js";
import { airPollution, currentWeather, forecast } from "../fixtures.js";
import { fetchMock, mockFetchAll, stubFetch } from "../mockFetch.js";
import { prisma } from "../../db/prisma.js";

stubFetch();

beforeEach(async () => {
	fetchMock.mockReset();
	await prisma.city.deleteMany();
});

afterAll(async () => {
	await prisma.$disconnect();
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

	it("persists a city after a successful forecast", async () => {
		mockFetchAll(forecast, null, null);

		await request(app).get("/api/weather/Gdansk");

		const savedCity = await prisma.city.findUnique({
			where: { name: "Gdansk" },
		});

		expect(savedCity).toMatchObject({
			name: "Gdansk",
			lat: 52.52,
			lon: 13.41,
		});
	});

	it("does not duplicate an existing city", async () => {
		mockFetchAll(forecast, null, null);

		await request(app).get("/api/weather/Gdansk");
		await request(app).get("/api/weather/Gdansk");

		const count = await prisma.city.count({
			where: { name: "Gdansk" },
		});

		expect(count).toBe(1);
	});

	it("does not persist a city when forecast fails", async () => {
		mockFetchAll(null, null, null);

		await request(app).get("/api/weather/Gdansk")

		const count = await prisma.city.count({
			where: { name: "Gdansk" },
		});

		expect(count).toBe(0); 
	})
});
