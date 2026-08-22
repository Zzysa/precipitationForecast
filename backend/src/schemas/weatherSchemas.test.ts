import { it, describe, expect } from "vitest";
import { CityParamsSchema } from "./weatherSchemas.js";

const city = { city: "     New York    " };

describe("CityParamsSchema", () => {
	it("happy case", () => {
		expect(CityParamsSchema.parse(city)).toStrictEqual({ city: "New York" });
	});

	it("city recives number", () => {
		expect(() => CityParamsSchema.parse({ city: 111 })).toThrow();
	});

    it("city recives nothing", () => {
		expect(() => CityParamsSchema.parse({ })).toThrow();
	});

    it("city recives many cities", () => {
		expect(() => CityParamsSchema.parse({ city: ["New York", "Gdansk"] })).toThrow();
	});
});
