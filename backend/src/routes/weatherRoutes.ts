import { Router } from "express";
import { getWeather } from "../controllers/weatherController.js";
import { authenticateOptional } from "../middlewares/authenticate.js";

const weatherRoutes = Router();

weatherRoutes.get("/:city", authenticateOptional, getWeather);

export { weatherRoutes };
