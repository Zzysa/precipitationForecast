import { Router } from "express";
import { weatherController } from "../controllers/weatherController.js";

const weatherRoutes = Router();

weatherRoutes.get("/:city", weatherController);

export { weatherRoutes };
