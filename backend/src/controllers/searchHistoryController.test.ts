import { vi, expect, describe, it, beforeEach } from "vitest";
import {
	getSearchHistory,
	deleteSearchHistory,
} from "./searchHistoryController.js";
import type { Request, Response } from "express";
import {
	getSearchHistoryForDemoUser,
	deleteSearchHistoryByCityIdForDemoUser,
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
			state: null,
			country: "PL",
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
	deleteSearchHistoryByCityIdForDemoUser: vi.fn(),
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
	it("deletes a row by city id", async () => {
		req = {
			params: { cityId: "3" },
		} as unknown as Request;

		vi.mocked(deleteSearchHistoryByCityIdForDemoUser).mockResolvedValue();

		await deleteSearchHistory(req, res);

		expect(deleteSearchHistoryByCityIdForDemoUser).toHaveBeenCalledWith(3);
		expect(res.status).toHaveBeenCalledWith(204);
		expect(res.send).toHaveBeenCalledWith();
	});

	it("throwing an error", async () => {
		req = {
			params: { cityId: "3" },
		} as unknown as Request;

		vi.mocked(deleteSearchHistoryByCityIdForDemoUser).mockRejectedValue(
			new Error("API down"),
		);

		await expect(deleteSearchHistory(req, res)).rejects.toThrow("API down");
	});

	it("rejects an invalid city id", async () => {
		req = {
			params: { cityId: "abc" },
		} as unknown as Request;

		await expect(deleteSearchHistory(req, res)).rejects.toThrow(
			"City id must be a number",
		);
		expect(deleteSearchHistoryByCityIdForDemoUser).not.toHaveBeenCalled();
	});
});
