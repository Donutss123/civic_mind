import { Router } from "express";
import { getPetugas } from "../controllers/users.controller";
import {
  authenticateToken,
  authorizeRole
} from "../middleware/auth.middleware";

const router = Router();

// Mengambil daftar petugas (khusus admin)
router.get(
  "/petugas",
  authenticateToken,
  authorizeRole("admin"),
  getPetugas
);

export default router;