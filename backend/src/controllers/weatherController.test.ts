import { vi, it, describe, expect, beforeEach } from "vitest";
import { getWeatherByCity } from "../services/weatherService.js";
import type { WeatherResponseDTO } from "../dtos/weather.dto.js";
import type { Request, Response } from "express";
import { getWeather } from "./weatherController.js";

const fakeWeather: WeatherResponseDTO = {
	hourlyForecast: [],
	maxPrecipitationChance: null,
	avgPrecipitationChance: null,
	currentWeather: null,
	avgAirPollution: null,
	hourlyAirPollution: null,
};

const req = { params: { city: "Gdansk" } } as unknown as Request;
const res = {
	status: vi.fn().mockReturnThis(),
	json: vi.fn(),
} as unknown as Response;

vi.mock("../services/weatherService.js", () => ({
	getWeatherByCity: vi.fn(),
}));

beforeEach(() => vi.clearAllMocks());

describe("getWeather", () => {
	it("happy case", async () => {
		vi.mocked(getWeatherByCity).mockResolvedValue(fakeWeather);

		await getWeather(req, res);

		expect(getWeatherByCity).toHaveBeenCalledWith("Gdansk");
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({ city: fakeWeather });
	});

	it("throwing an error", async () => {
		vi.mocked(getWeatherByCity).mockRejectedValue(new Error("API down"));

		await expect(getWeather(req, res)).rejects.toThrow("API down");
	});
});
