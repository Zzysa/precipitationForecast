import { vi, expect, describe, it, beforeEach } from "vitest";
import { getSearchHistory } from "./searchHistoryController.js";
import type { Request, Response } from "express";
import { getSearchHistoryForDemoUser } from "../services/searchHistoryService.js";

const req = {} as unknown as Request;
const res = {
	status: vi.fn().mockReturnThis(),
	json: vi.fn(),
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
