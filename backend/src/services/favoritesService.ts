import { prisma } from "../db/prisma.js";
import type { CreateFavoriteInputType } from "../schemas/weatherSchemas.js";

const createFavoriteForUser = async (
	city: CreateFavoriteInputType,
	userId: number,
) => {
	let lat = city.lat;
	let lon = city.lon;

	if (lat === 0 && lon === 0) {
		try {
			const q = city.country ? `${city.name},${city.country}` : city.name;
			const geoRes = await fetch(
				`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${process.env.WEATHER_API_KEY}`,
			);
			if (geoRes.ok) {
				const geoData = (await geoRes.json()) as Array<{
					lat: number;
					lon: number;
				}>;
				if (geoData.length > 0 && geoData[0]) {
					lat = geoData[0].lat;
					lon = geoData[0].lon;
				}
			}
		} catch {
		}
	}

	const savedCity = await prisma.city.upsert({
		where: { lat_lon: { lat, lon } },
		update: {},
		create: {
			name: city.name,
			lat,
			lon,
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
