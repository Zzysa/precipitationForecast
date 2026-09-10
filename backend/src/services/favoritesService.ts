import { prisma } from "../db/prisma.js";
import type { CreateFavoriteInputType } from "../schemas/weatherSchemas.js";

const createFavoriteForUser = async (
	city: CreateFavoriteInputType,
	userId: number,
) => {
	const savedCity = await prisma.city.upsert({
		where: { lat_lon: { lat: city.lat, lon: city.lon } },
		update: {},
		create: {
			name: city.name,
			lat: city.lat,
			lon: city.lon,
			state: city.state,
			country: city.country,
		},
		select: { id: true },
	});

	await prisma.favorite.upsert({
		where: {
			userId_cityId: {
				userId,
				cityId: savedCity.id,
			},
		},
		update: {},
		create: {
			userId,
			cityId: savedCity.id,
		},
	});
};

const deleteFavoriteForUser = async (cityId: number, userId: number) => {
	await prisma.favorite.deleteMany({
		where: {
			userId,
			cityId,
		},
	});
};

const getFavoriteForUser = async (userId: number) => {
	return await prisma.favorite.findMany({
		where: {
			userId,
		},
		include: { city: true },
		orderBy: { createdAt: "desc" },
	});
};

export { createFavoriteForUser, deleteFavoriteForUser, getFavoriteForUser };
