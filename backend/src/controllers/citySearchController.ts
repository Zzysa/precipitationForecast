import type { Request, Response } from "express";
import { getCitySearchByCityAndCountry } from "../services/citySearchService.js";
import { CitySearchQuerySchema } from "../schemas/citySearchSchemas.js";

const getCitySearch = async (req: Request, res: Response) => {
	const { city, country } = CitySearchQuerySchema.parse(req.query);

	const data = await getCitySearchByCityAndCountry(city, country);

	res.status(200).json({ cities: data });
};

export { getCitySearch };
