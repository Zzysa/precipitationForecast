import type { Request, Response } from "express";
import { vi, expect, describe, it, beforeEach } from "vitest";
import { getCitySearch } from "./citySearchController.js";
import { getCitySearchByCityAndCountry } from "../services/citySearchService.js";
import { ZodError } from "zod";

let req = {
	query: {
		city: "Gdansk",
		country: "PL",
	},
} as unknown as Request;
const res = {
	status: vi.fn().mockReturnThis(),
	json: vi.fn(),
} as unknown as Response;

const expectedCities = [
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
];

vi.mock("../services/citySearchService.js", () => ({
	getCitySearchByCityAndCountry: vi.fn(),
}));

beforeEach(() => {
	vi.clearAllMocks();
	req = {
		query: {
			city: "Gdansk",
			country: "PL",
		},
	} as unknown as Request;
});

describe("getCitySearch", () => {
	it("returns correct status and json", async () => {
		vi.mocked(getCitySearchByCityAndCountry).mockResolvedValueOnce(
			expectedCities,
		);

		await getCitySearch(req, res);

		expect(getCitySearchByCityAndCountry).toHaveBeenCalledWith(
			"Gdansk",
			"PL",
			null,
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({ cities: expectedCities });
	});

	it("passes null when country is missing", async () => {
		req = {
			query: {
				city: "Gdansk",
			},
		} as unknown as Request;
		vi.mocked(getCitySearchByCityAndCountry).mockResolvedValueOnce(
			expectedCities,
		);

		await getCitySearch(req, res);

		expect(getCitySearchByCityAndCountry).toHaveBeenCalledWith(
			"Gdansk",
			null,
			null,
		);
	});

	it("passes user id when the request is authenticated", async () => {
		req = {
			query: {
				city: "Gdansk",
				country: "PL",
			},
			user: { id: 7 },
		} as unknown as Request;
		vi.mocked(getCitySearchByCityAndCountry).mockResolvedValueOnce(
			expectedCities,
		);

		await getCitySearch(req, res);

		expect(getCitySearchByCityAndCountry).toHaveBeenCalledWith(
			"Gdansk",
			"PL",
			7,
		);
	});

	it("rejects invalid query", async () => {
		req = {
			query: {
				city: "",
			},
		} as unknown as Request;

		await expect(getCitySearch(req, res)).rejects.toBeInstanceOf(ZodError);
		expect(getCitySearchByCityAndCountry).not.toHaveBeenCalled();
	});

	it("propagates service error", async () => {
		vi.mocked(getCitySearchByCityAndCountry).mockRejectedValueOnce(
			new Error("API down"),
		);

		await expect(getCitySearch(req, res)).rejects.toThrow("API down");
	});
});
