
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
import { uploadPhoto } from "../middleware/upload.middleware";

const router = Router();

// Mengambil laporan sesuai hak akses pengguna.
router.get("/", authenticateToken, getReports);

// Membuat laporan warga sekaligus menerima satu file foto.
router.post(
  "/",
  authenticateToken,
  authorizeRole("warga"),
  uploadPhoto.single("photo"),
  createReport
);

// Mengambil detail laporan.
router.get("/:id", authenticateToken, getReportById);

// Memperbarui status laporan.
router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRole("petugas", "admin"),
  updateReportStatus
);

// Menugaskan laporan kepada petugas.
router.patch(
  "/:id/assign",
  authenticateToken,
  authorizeRole("admin"),
  assignReport
);

export default router;
