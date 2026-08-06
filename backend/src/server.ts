import express from "express";
import cors from "cors";
import { weatherRoutes } from "./routes/weatherRoutes.js";
import { errorHandler } from "./errorHandler.js";

const app = express();
const port = 3000;

app.use(cors());
app.use("/api/weather", weatherRoutes);
app.use(errorHandler);

app.listen(3000, () => {});
