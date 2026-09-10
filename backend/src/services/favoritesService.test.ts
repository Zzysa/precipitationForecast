import { vi, expect, describe, it } from "vitest";
import { prisma } from "../db/prisma.js";
import {
	createFavoriteForUser,
	deleteFavoriteForUser,
	getFavoriteForUser,
} from "./favoritesService.js";
import type { CreateFavoriteInputType } from "../schemas/weatherSchemas.js";

const userId = 7;

const favorite = Array.from({ length: 10 }, (_, i) => ({
	id: i + 1,
	userId,
	cityId: i + 1,
	createdAt: new Date(1710000000 + i),
}));

const cityInput: CreateFavoriteInputType = {
	name: "Gdansk",
	state: null,
	country: "PL",
	lat: 54.352,
	lon: 18.6466,
};

const savedCity = {
	id: 8,
	...cityInput,
};

vi.mock("../db/prisma.js", () => ({
	prisma: {
		city: {
			upsert: vi.fn(),
		},
		favorite: {
			upsert: vi.fn(),
			deleteMany: vi.fn(),
			findMany: vi.fn(),
		},
	},
}));

vi.mocked(prisma.favorite.findMany).mockResolvedValueOnce(favorite);
vi.mocked(prisma.city.upsert).mockResolvedValue(savedCity);

describe("createFavoriteForUser", () => {
	it("creates favorite for the given user", async () => {
		await createFavoriteForUser(cityInput, userId);

		expect(prisma.city.upsert).toHaveBeenCalledWith({
			where: { lat_lon: { lat: cityInput.lat, lon: cityInput.lon } },
			update: {},
			create: {
				name: cityInput.name,
				lat: cityInput.lat,
				lon: cityInput.lon,
				state: cityInput.state,
				country: cityInput.country,
			},
			select: { id: true },
		});

		expect(prisma.favorite.upsert).toHaveBeenCalledWith({
			where: {
				userId_cityId: {
					userId,
					cityId: 8,
				},
			},
			update: {},
			create: {
				userId,
				cityId: 8,
			},
		});
	});
});

describe("deleteFavoriteForUser", () => {
	it("deletes favorite row by city id for the given user", async () => {
		const cityId = 15;

		await deleteFavoriteForUser(cityId, userId);

		expect(prisma.favorite.deleteMany).toHaveBeenCalledWith({
			where: {
				userId,
				cityId,
			},
		});
	});
});

describe("getFavoriteForUser", () => {
	it("returns favorite cities for the given user", async () => {
		const result = await getFavoriteForUser(userId);

		expect(prisma.favorite.findMany).toHaveBeenCalledWith({
			where: {
				userId,
			},
			include: { city: true },
			orderBy: { createdAt: "desc" },
		});
		expect(result).toEqual(favorite);
	});
});
