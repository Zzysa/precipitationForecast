import { it, describe, expect } from "vitest";
import {
	CityIdParamsSchema,
	CityParamsSchema,
	CitySearchQuerySchema,
	CreateFavoriteBodySchema,
} from "./weatherSchemas.js";
import { ZodError } from "zod";

const city = { city: "     New York    " };

describe("CityParamsSchema", () => {
	it("happy case", () => {
		expect(CityParamsSchema.parse(city)).toStrictEqual({ city: "New York" });
	});

	it("city recives number", () => {
		expect(() => CityParamsSchema.parse({ city: 111 })).toThrow();
	});

	it("city recives nothing", () => {
		expect(() => CityParamsSchema.parse({})).toThrow();
	});

	it("city recives many cities", () => {
		expect(() =>
			CityParamsSchema.parse({ city: ["New York", "Gdansk"] }),
		).toThrow();
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

describe("CreateFavoriteBodySchema", () => {
	const valid = {
		name: "Gdansk",
		state: null,
		country: "PL",
		lat: 54.352,
		lon: 18.6466,
	};

	it("parses valid body", () => {
		expect(CreateFavoriteBodySchema.parse(valid)).toEqual(valid);
	});

	it("reject a non-object", () => {
		expect(() => CreateFavoriteBodySchema.parse(123)).toThrow();
	});

	it("reject a numeric name", () => {
		expect(() =>
			CreateFavoriteBodySchema.parse({ ...valid, name: 123 }),
		).toThrow();
	});

	it("reject a numeric state", () => {
		expect(() =>
			CreateFavoriteBodySchema.parse({ ...valid, state: 123 }),
		).toThrow();
	});

	it("reject a non-numeric lat", () => {
		expect(() =>
			CreateFavoriteBodySchema.parse({ ...valid, lat: "123" }),
		).toThrow();
	});

	it("reject a non-numeric lon", () => {
		expect(() =>
			CreateFavoriteBodySchema.parse({ ...valid, lon: "123" }),
		).toThrow();
	});

	it("reject a numeric country", () => {
		expect(() =>
			CreateFavoriteBodySchema.parse({ ...valid, country: 123 }),
		).toThrow();
	});
});

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
