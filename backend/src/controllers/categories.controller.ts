
import { Request, Response } from "express";
import { pool } from "../config/database";

// Mengambil seluruh kategori yang masih aktif.
export async function getCategories(_req: Request, res: Response) {
  try {
    const result = await pool.query(
      `SELECT id, name, description
       FROM public.categories
       WHERE is_active = TRUE
       ORDER BY id ASC`
    );

    return res.status(200).json({
      success: true,
      message: "Data kategori berhasil diambil",
      data: result.rows
    });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server"
    });
  }
}
