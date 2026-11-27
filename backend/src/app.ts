
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import reportsRoutes from "./routes/reports.routes";
import categoriesRoutes from "./routes/categories.routes";

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/categories", categoriesRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "CivicMind API is running"
  });
});

export default app;
