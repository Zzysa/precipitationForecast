import { vi, describe, it, expect } from "vitest";
import { getSearchHistoryForDemoUser } from "./searchHistoryService.js";
import { prisma } from "../db/prisma.js";

const history = Array.from({ length: 15 }, (_, i) => ({
	id: i + 1,
	userId: 7,
	cityId: i + 1,
	searchedAt: new Date(1710000000 + i),
}));

export const expectedHistory = history.slice(0, 10);

vi.mock("../db/prisma.js", () => ({
	prisma: {
		user: {
			findUniqueOrThrow: vi.fn(),
		},
		searchHistory: {
			findMany: vi.fn(),
		},
	},
}));

vi.mocked(prisma.user.findUniqueOrThrow).mockResolvedValue({
	id: 7,
	username: "demo",
});

vi.mocked(prisma.searchHistory.findMany).mockResolvedValue(expectedHistory);

describe("searchHistoryService", () => {
	it("returns the latest search history for demo user", async () => {
		const result = await getSearchHistoryForDemoUser();

		expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
			where: { username: "demo" },
			select: { id: true },
		});

		expect(prisma.searchHistory.findMany).toHaveBeenCalledWith({
			where: { userId: 7 },
			include: { city: true },
			orderBy: { searchedAt: "desc" },
			take: 10,
		});

		expect(result).toEqual(expectedHistory);
	});
});
