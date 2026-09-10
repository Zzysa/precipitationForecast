import { vi, describe, it, expect } from "vitest";
import {
	getSearchHistoryForUser,
	deleteSearchHistoryByCityIdForUser,
} from "./searchHistoryService.js";
import { prisma } from "../db/prisma.js";

const userId = 7;

const history = Array.from({ length: 15 }, (_, i) => ({
	id: i + 1,
	userId,
	cityId: i + 1,
	searchedAt: new Date(1710000000 + i),
}));

export const expectedHistory = history.slice(0, 10);

vi.mock("../db/prisma.js", () => ({
	prisma: {
		searchHistory: {
			findMany: vi.fn(),
			deleteMany: vi.fn(),
		},
	},
}));

vi.mocked(prisma.searchHistory.findMany).mockResolvedValue(expectedHistory);

describe("searchHistoryService", () => {
	it("returns the latest search history for the given user", async () => {
		const result = await getSearchHistoryForUser(userId);

		expect(prisma.searchHistory.findMany).toHaveBeenCalledWith({
			where: { userId },
			include: { city: true },
			orderBy: { searchedAt: "desc" },
			take: 10,
		});

		expect(result).toEqual(expectedHistory);
	});
});

describe("deleteSearchHistoryByCityIdForUser", () => {
	it("deletes search history row by city id for the given user", async () => {
		const cityId = 12;

		await deleteSearchHistoryByCityIdForUser(cityId, userId);

		expect(prisma.searchHistory.deleteMany).toHaveBeenCalledWith({
			where: {
				userId,
				cityId,
			},
		});
	});
});
