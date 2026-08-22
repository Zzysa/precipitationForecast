import express from "express";
import cors from "cors";
import { weatherRoutes } from "./routes/weatherRoutes.js";
import { searchHistoryRoutes } from "./routes/searchHistoryRoutes.js";
import { errorHandler } from "./errorHandler.js";

const app = express();

app.use(cors());
app.use("/api/weather", weatherRoutes);
app.use("/api/search-history", searchHistoryRoutes);
app.use(errorHandler);

export { app };
