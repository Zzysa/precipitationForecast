import { Router } from "express";
import { getCitySearch } from "../controllers/citySearchController.js";

const citySearchRoutes = Router();

citySearchRoutes.get("/", getCitySearch);

export { citySearchRoutes };
