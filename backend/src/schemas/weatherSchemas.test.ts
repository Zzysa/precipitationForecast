import { it, describe, expect } from "vitest";
import { CityIdParamsSchema, CityParamsSchema } from "./weatherSchemas.js";

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

describe("CityIdParamsSchema", () => {
	it("coerces a numeric string to a number", () => {
		expect(CityIdParamsSchema.parse({ cityId: "7" })).toStrictEqual({
			cityId: 7,
		});
	});

	it("rejects a non-numeric id", () => {
		expect(() => CityIdParamsSchema.parse({ cityId: "abc" })).toThrow(
			"City id must be a number",
		);
	});

	it("rejects a decimal id", () => {
		expect(() => CityIdParamsSchema.parse({ cityId: "1.5" })).toThrow(
			"City id must be an integer",
		);
	});

	it("rejects a non-positive id", () => {
		expect(() => CityIdParamsSchema.parse({ cityId: "0" })).toThrow(
			"City id must be a positive number",
		);
	});
});
