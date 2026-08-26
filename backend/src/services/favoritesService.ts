import { prisma } from "../db/prisma.js";
import type { CreateFavoriteInputType } from "../schemas/weatherSchemas.js";

const createFavoriteForDemoUser = async (city: CreateFavoriteInputType) => {
	const demoUser = await prisma.user.findUniqueOrThrow({
		where: { username: "demo" },
		select: { id: true },
	});

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
				userId: demoUser.id,
				cityId: savedCity.id,
			},
		},
		update: {},
		create: {
			userId: demoUser.id,
			cityId: savedCity.id,
		},
	});
};

export { createFavoriteForDemoUser };
