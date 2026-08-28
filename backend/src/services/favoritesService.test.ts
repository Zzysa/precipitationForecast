import { vi, expect, describe, it } from "vitest";
import { prisma } from "../db/prisma.js";
import {
	createFavoriteForDemoUser,
	deleteFavoriteForDemoUser,
	getFavoriteForDemoUser,
} from "./favoritesService.js";
import type { CreateFavoriteInputType } from "../schemas/weatherSchemas.js";

const favorite = Array.from({ length: 10 }, (_, i) => ({
	id: i + 1,
	userId: 7,
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
		user: {
			findUniqueOrThrow: vi.fn(),
		},
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

vi.mocked(prisma.user.findUniqueOrThrow).mockResolvedValue({
	id: 7,
	username: "demo",
});

vi.mocked(prisma.city.upsert).mockResolvedValue(savedCity);

describe("createFavoriteForDemoUser", () => {
	it("create favorite for a demo user", async () => {
		await createFavoriteForDemoUser(cityInput);

		expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
			where: { username: "demo" },
			select: { id: true },
		});

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
					userId: 7,
					cityId: 8,
				},
			},
			update: {},
			create: {
				userId: 7,
				cityId: 8,
			},
		});
	});
});

describe("deleteFavoriteForDemoUser", () => {
	it("delete favorite row by city id", async () => {
		const cityId = 15;

		await deleteFavoriteForDemoUser(cityId);

		expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
			where: {
				username: "demo",
			},
			select: { id: true },
		});

		expect(prisma.favorite.deleteMany).toHaveBeenCalledWith({
			where: {
				userId: 7,
				cityId,
			},
		});
	});
});

describe("getFavoriteForDemoUser", () => {
	it("returns favorite cities for a demo user", async () => {
		const result = await getFavoriteForDemoUser();

		expect(prisma.user.findUniqueOrThrow).toHaveBeenCalledWith({
			where: {
				username: "demo",
			},
			select: { id: true },
		});

		expect(prisma.favorite.findMany).toHaveBeenCalledWith({
			where: {
				userId: 7,
			},
			include: { city: true },
			orderBy: { createdAt: "desc" },
		});
		expect(result).toEqual(favorite);
	});
});
