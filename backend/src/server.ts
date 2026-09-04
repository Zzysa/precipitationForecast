import express from "express";
import cors from "cors";
import { weatherRoutes } from "./routes/weatherRoutes.js";
import { searchHistoryRoutes } from "./routes/searchHistoryRoutes.js";
import { favoritesRoutes } from "./routes/favoritesRoutes.js";
import { errorHandler } from "./errorHandler.js";
import { citySearchRoutes } from "./routes/citySearchRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/weather", weatherRoutes);
app.use("/api/search-history", searchHistoryRoutes);
app.use("/api/city-search", citySearchRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/auth", authRoutes);
app.use(errorHandler);

export { app };
