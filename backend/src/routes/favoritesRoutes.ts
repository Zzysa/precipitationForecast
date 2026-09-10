import { Router } from "express";
import {
	createFavorite,
	deleteFavorite,
	getFavorites,
} from "../controllers/favoritesController.js";
import { authenticate } from "../middlewares/authenticate.js";

const favoritesRoutes = Router();

favoritesRoutes.post("/", authenticate, createFavorite);
favoritesRoutes.delete("/:cityId", authenticate, deleteFavorite);
favoritesRoutes.get("/", authenticate, getFavorites);

export { favoritesRoutes };
