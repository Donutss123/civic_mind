import { Router } from "express";
import {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  assignReport,
} from "../controllers/reports.controller";
import {
  authenticateToken,
  authorizeRole,
} from "../middleware/auth.middleware";

const router = Router();

// Get seluruh laporan (akses berdasarkan role di controller)
router.get("/", authenticateToken, getReports);

// Create laporan (khusus warga)
router.post("/", authenticateToken, authorizeRole("warga"), createReport);

// Get detail laporan
router.get("/:id", authenticateToken, getReportById);

// Update status laporan (khusus petugas dan admin)
router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRole("petugas", "admin"),
  updateReportStatus
);

// Assign petugas ke laporan (khusus admin)
router.patch(
  "/:id/assign",
  authenticateToken,
  authorizeRole("admin"),
  assignReport
);

export default router;