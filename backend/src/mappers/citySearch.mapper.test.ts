import type { OWGeocodingResponse } from "../dtos/openWeather.dto.js";
import { describe, expect, it } from "vitest";
import { mapCitiesToSearchResults } from "./citySearch.mapper.js";

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

const flags = {
	isFavorite: false,
	isInSearchHistory: false,
};

describe("mapCitiesToSearchResults", () => {
	it("returns correctly mapped data", () => {
		const result = mapCitiesToSearchResults(geocodingResponse, flags);

		expect(result).toEqual([
			{
				cityId: null,
				name: "Springfield",
				state: "Illinois",
				country: "US",
				lat: 39.8017,
				lon: -89.6436,
				isFavorite: false,
				isInSearchHistory: false,
			},
			{
				cityId: null,
				name: "Gdansk",
				state: null,
				country: "PL",
				lat: 54.352,
				lon: 18.6466,
				isFavorite: false,
				isInSearchHistory: false,
			},
		]);
	});

	it("returns an empty array when data is empty ", () => {
		expect(mapCitiesToSearchResults([], flags)).toEqual([]);
	});
});
