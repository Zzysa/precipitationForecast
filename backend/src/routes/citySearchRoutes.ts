import { Router } from "express";
import { getCitySearch } from "../controllers/citySearchController.js";
import { authenticateOptional } from "../middlewares/authenticate.js";

const citySearchRoutes = Router();

citySearchRoutes.get("/", authenticateOptional, getCitySearch);

export { citySearchRoutes };
