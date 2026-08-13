import { it, expect, describe, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../server.js";
import { mapToWeatherDTO } from "../../mappers/weather.mapper.js";
import { airPollution, currentWeather, forecast } from "../fixtures.js";
import { fetchMock, mockFetchAll, stubFetch } from "../mockFetch.js";

stubFetch();

beforeEach(() => {
	fetchMock.mockReset();
});

describe("/api/weather/:city", () => {
	it("GET happy case", async () => {
		mockFetchAll(forecast, currentWeather, airPollution);

		const res = await request(app).get("/api/weather/Gdansk");

		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			city: mapToWeatherDTO(forecast, currentWeather, airPollution),
		});
	});

	it("GET invalid city", async () => {
		const res = await request(app).get("/api/weather/%20%20");

		expect(res.status).toBe(400);
		expect(res.body.error[0].message).toBe("City name cannot be empty");
	});

	it("GET no data for forecast", async () => {
		mockFetchAll(null, null, null);

		const res = await request(app).get("/api/weather/Gdansk");

		expect(res.status).toBe(500);
		expect(res.body).toEqual({ error: "error" });
	});
});
