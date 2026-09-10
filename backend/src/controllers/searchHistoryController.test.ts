import { vi, expect, describe, it, beforeEach } from "vitest";
import {
	getSearchHistory,
	deleteSearchHistory,
} from "./searchHistoryController.js";
import type { Request, Response } from "express";
import {
	getSearchHistoryForUser,
	deleteSearchHistoryByCityIdForUser,
} from "../services/searchHistoryService.js";

let req = {
	user: { id: 7 },
} as unknown as Request;
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
	req = {
		user: { id: 7 },
	} as unknown as Request;
});

vi.mock("../services/searchHistoryService.js", () => ({
	getSearchHistoryForUser: vi.fn(),
	deleteSearchHistoryByCityIdForUser: vi.fn(),
}));

describe("searchHistoryController", () => {
	it("returns search history", async () => {
		vi.mocked(getSearchHistoryForUser).mockResolvedValue(expectedHistory);

		await getSearchHistory(req, res);

		expect(getSearchHistoryForUser).toHaveBeenCalledWith(7);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({ history: expectedHistory });
	});

	it("throwing an error", async () => {
		vi.mocked(getSearchHistoryForUser).mockRejectedValue(new Error("API down"));

		await expect(getSearchHistory(req, res)).rejects.toThrow("API down");
	});
});

describe("deleteSearchHistory", () => {
	it("deletes a row by city id", async () => {
		req = {
			params: { cityId: "3" },
			user: { id: 7 },
		} as unknown as Request;

		vi.mocked(deleteSearchHistoryByCityIdForUser).mockResolvedValue();

		await deleteSearchHistory(req, res);

		expect(deleteSearchHistoryByCityIdForUser).toHaveBeenCalledWith(3, 7);
		expect(res.status).toHaveBeenCalledWith(204);
		expect(res.send).toHaveBeenCalledWith();
	});

	it("throwing an error", async () => {
		req = {
			params: { cityId: "3" },
			user: { id: 7 },
		} as unknown as Request;

		vi.mocked(deleteSearchHistoryByCityIdForUser).mockRejectedValue(
			new Error("API down"),
		);

		await expect(deleteSearchHistory(req, res)).rejects.toThrow("API down");
	});

	it("rejects an invalid city id", async () => {
		req = {
			params: { cityId: "abc" },
			user: { id: 7 },
		} as unknown as Request;

		await expect(deleteSearchHistory(req, res)).rejects.toThrow(
			"City id must be a number",
		);
		expect(deleteSearchHistoryByCityIdForUser).not.toHaveBeenCalled();
	});
});
