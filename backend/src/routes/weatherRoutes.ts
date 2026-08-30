import { Router } from "express";
import { getWeather } from "../controllers/weatherController.js";

const weatherRoutes = Router();

weatherRoutes.get("/:city", getWeather);

export { weatherRoutes };
