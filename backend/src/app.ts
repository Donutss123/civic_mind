import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import reportsRoutes from "./routes/reports.routes";

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportsRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "CivicMind API is running"
  });
});

export default app;