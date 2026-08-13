import express from "express";
import cors from "cors";
import { weatherRoutes } from "./routes/weatherRoutes.js";
import { errorHandler } from "./errorHandler.js";

const app = express();

app.use(cors());
app.use("/api/weather", weatherRoutes);
app.use(errorHandler);

export { app };
