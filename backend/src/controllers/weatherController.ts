import type { Request, Response } from "express";
import {
	CityParamsSchema,
	WeatherQuerySchema,
} from "../schemas/weatherSchemas.js";
import { getWeatherByCity } from "../services/weatherService.js";

const getWeather = async (req: Request, res: Response) => {
	const { city } = CityParamsSchema.parse(req.params);
	const query = WeatherQuerySchema.parse(req.query);

	const coordinates =
		query.lat !== undefined && query.lon !== undefined
			? { lat: query.lat, lon: query.lon }
			: undefined;

	const data = coordinates
		? await getWeatherByCity(city, req.user?.id ?? null, coordinates)
		: await getWeatherByCity(city, req.user?.id ?? null);

	res.status(200).json({ city: data });
};

export { getWeather };
