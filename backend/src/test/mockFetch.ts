import { vi } from "vitest";
import { forecast, currentWeather, airPollution } from "./fixtures.js";
import type {
	OWAirPollutionResponse,
	OWCurrentWeatherResponse,
	OWForecastResponse,
} from "../dtos/openWeather.dto.js";

const mockResponse = (data: unknown, ok = true) => ({
	ok,
	json: () => Promise.resolve(data),
	text: () => Promise.resolve("error"),
});

const fetchMock = vi.fn();

const stubFetch = () => {
	vi.stubGlobal("fetch", fetchMock);
};

const mockFetchAll = (
	forecast: null | OWForecastResponse = null,
	currentWeather: null | OWCurrentWeatherResponse = null,
	airPollution: null | OWAirPollutionResponse = null,
) => {
	fetchMock.mockImplementation((url: string) => {
		if (url.includes("forecast?q"))
			return Promise.resolve(mockResponse(forecast, forecast ? true : false));
		if (url.includes("/weather?q"))
			return Promise.resolve(
				mockResponse(currentWeather, currentWeather ? true : false),
			);
		if (url.includes("air_pollution"))
			return Promise.resolve(
				mockResponse(airPollution, airPollution ? true : false),
			);
		return Promise.reject(new Error("unknown url"));
	});
};

export { mockFetchAll, stubFetch, fetchMock };
