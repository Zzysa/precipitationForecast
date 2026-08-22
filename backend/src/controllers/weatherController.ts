import type { Request, Response } from "express";
import { CityParamsSchema } from "../schemas/weatherSchemas.js";
import { getWeatherByCity } from "../services/weatherService.js";

const weatherController = async (req: Request, res: Response) => {
	const { city } = CityParamsSchema.parse(req.params);

	const data = await getWeatherByCity(city);

	res.status(200).json({ city: data });
};

export { weatherController };
