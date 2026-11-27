
import { Router } from "express";
import { getCategories } from "../controllers/categories.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Mengambil kategori aktif untuk pengguna yang sudah login.
router.get("/", authenticateToken, getCategories);

export default router;
