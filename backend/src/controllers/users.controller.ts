import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { pool } from "../config/database";

// ==================== GET DAFTAR PETUGAS ====================

export async function getPetugas(req: Request, res: Response) {
  try {
    const authenticatedReq = req as AuthenticatedRequest;

    // Pastikan hanya admin yang dapat mengakses daftar petugas
    if (!authenticatedReq.user || authenticatedReq.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Akses hanya untuk admin"
      });
    }

    const result = await pool.query(
      `SELECT id, name
       FROM public.users
       WHERE role = 'petugas'
       ORDER BY name ASC`
    );

    return res.status(200).json({
      success: true,
      message: "Daftar petugas berhasil diambil",
      data: result.rows
    });
  } catch (error) {
    console.error("GET PETUGAS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server"
    });
  }
}