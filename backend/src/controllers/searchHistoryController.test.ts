import { vi, expect, describe, it, beforeEach } from "vitest";
import {
	getSearchHistory,
	deleteSearchHistory,
} from "./searchHistoryController.js";
import type { Request, Response } from "express";
import {
	getSearchHistoryForDemoUser,
	deleteSearchHistoryByCityNameForDemoUser,
} from "../services/searchHistoryService.js";

let req = {} as unknown as Request;
const res = {
	status: vi.fn().mockReturnThis(),
	json: vi.fn(),
	send: vi.fn(),
} as unknown as Response;

const expectedHistory = [
	{
		id: 1,
		userId: 7,
		cityId: 3,
		searchedAt: new Date(),
		city: {
			id: 3,
			name: "Gdansk",
			lat: 52.52,
			lon: 13.41,
		},
	},
];

beforeEach(() => {
	vi.clearAllMocks();
});

vi.mock("../services/searchHistoryService.js", () => ({
	getSearchHistoryForDemoUser: vi.fn(),
	deleteSearchHistoryByCityNameForDemoUser: vi.fn(),
}));

describe("searchHistoryController", () => {
	it("returns search history", async () => {
		vi.mocked(getSearchHistoryForDemoUser).mockResolvedValue(expectedHistory);

		await getSearchHistory(req, res);

		expect(getSearchHistoryForDemoUser).toHaveBeenCalledWith();
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({ history: expectedHistory });
	});

	it("throwing an error", async () => {
		vi.mocked(getSearchHistoryForDemoUser).mockRejectedValue(
			new Error("API down"),
		);

		await expect(getSearchHistory(req, res)).rejects.toThrow("API down");
	});
});

describe("deleteSearchHistory", () => {
	it("delete row by city name", async () => {
		req = {
			params: { city: "Gdansk" },
		} as unknown as Request;

		vi.mocked(deleteSearchHistoryByCityNameForDemoUser).mockResolvedValue();

		await deleteSearchHistory(req, res);

		expect(deleteSearchHistoryByCityNameForDemoUser).toHaveBeenCalledWith(
			"Gdansk",
		);
		expect(res.status).toHaveBeenCalledWith(204);
		expect(res.send).toHaveBeenCalledWith();
	});

	it("throwing an error", async () => {
		vi.mocked(deleteSearchHistoryByCityNameForDemoUser).mockRejectedValue(
			new Error("API down"),
		);

		await expect(deleteSearchHistory(req, res)).rejects.toThrow("API down");
	});

	it("returns 400 for an empty city", async () => {
		req = {
			params: { city: "  " },
		} as unknown as Request;

		await expect(deleteSearchHistory(req, res)).rejects.toThrow();
		expect(deleteSearchHistoryByCityNameForDemoUser).not.toHaveBeenCalled();
	});
});
