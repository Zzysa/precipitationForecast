import { CitySearchQuerySchema } from "./citySearchSchemas.js";
import { describe, it, expect } from "vitest";

describe("CitySearchQuerySchema", () => {
	const valid = {
		city: "Gdansk",
		country: "PL",
	};

	it("parse valid query", () => {
		expect(CitySearchQuerySchema.parse(valid)).toEqual(valid);
	});

	it("rejects a numeric city", () => {
		expect(() => CitySearchQuerySchema.parse({ ...valid, city: 123 })).toThrow(
			"Only one city name must be provided",
		);
	});

	it("rejects empty city", () => {
		expect(() => CitySearchQuerySchema.parse({ ...valid, city: "" })).toThrow(
			"City name cannot be empty",
		);
	});

	it("rejects a numeric country", () => {
		expect(() =>
			CitySearchQuerySchema.parse({ ...valid, country: 123 }),
		).toThrow("Country must be a string");
	});

	it("reject a country longer than two letters", () => {
		expect(() =>
			CitySearchQuerySchema.parse({ ...valid, country: "POL" }),
		).toThrow("Country must be a 2-letter code");
	});

	it("transform undefined country to null", () => {
		expect(
			CitySearchQuerySchema.parse({ ...valid, country: undefined }),
		).toEqual({
			city: "Gdansk",
			country: null,
		});
	});
});
