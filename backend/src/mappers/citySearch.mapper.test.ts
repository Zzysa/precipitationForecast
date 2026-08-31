import type { OWGeocodingResponse } from "../dtos/openWeather.dto.js";
import { describe, expect, it } from "vitest";
import { mapGeocodingToCitySearchResult } from "./citySearch.mapper.js";

const geocodingResponse: OWGeocodingResponse = [
	{
		name: "Springfield",
		state: "Illinois",
		country: "US",
		lat: 39.8017,
		lon: -89.6436,
	},
	{
		name: "Gdansk",
		country: "PL",
		lat: 54.352,
		lon: 18.6466,
	},
];

describe("mapGeocodingToCitySearchResult", () => {
	it("returns correctly mapped data", () => {
		const result = mapGeocodingToCitySearchResult(geocodingResponse);

		expect(result).toEqual([
			{
				name: "Springfield",
				state: "Illinois",
				country: "US",
				lat: 39.8017,
				lon: -89.6436,
			},
			{
				name: "Gdansk",
				state: null,
				country: "PL",
				lat: 54.352,
				lon: 18.6466,
			},
		]);
	});

	it("returns an empty array when data is empty ", () => {
		expect(mapGeocodingToCitySearchResult([])).toEqual([]);
	});
});
