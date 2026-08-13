import { it, describe, expect } from "vitest";
import { WeatherQuerySchema } from "./weatherSchemas.js";

const city = { city: "     New York    " };

describe("WeatherQuerySchema", () => {
	it("happy case", () => {
		expect(WeatherQuerySchema.parse(city)).toStrictEqual({ city: "New York" });
	});

	it("city recives number", () => {
		expect(() => WeatherQuerySchema.parse({ city: 111 })).toThrow();
	});

    it("city recives nothing", () => {
		expect(() => WeatherQuerySchema.parse({ })).toThrow();
	});

    it("city recives many cities", () => {
		expect(() => WeatherQuerySchema.parse({ city: ["New York", "Gdansk"] })).toThrow();
	});
});
