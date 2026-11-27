import { Request, Response } from "express";
import { z } from "zod";
import { pool } from "../config/database";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const createReportSchema = z.object({
  category_id: z.number().int().positive(),
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10),
  location: z.string().trim().min(3),
  photo_url: z.string().url().optional().or(z.literal(""))
});

export async function createReport(req: Request, res: Response) {
  try {
    const authenticatedReq = req as AuthenticatedRequest;

    if (!authenticatedReq.user) {
      return res.status(401).json({
        success: false,
        message: "Tidak terautentikasi"
      });
    }

    const validation = createReportSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Data laporan tidak valid",
        errors: validation.error.flatten()
      });
    }

    const {
      category_id,
      title,
      description,
      location,
      photo_url
    } = validation.data;

    const result = await pool.query(
      `INSERT INTO public.reports
        (user_id, category_id, title, description, location, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        authenticatedReq.user.id,
        category_id,
        title,
        description,
        location,
        photo_url || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Laporan berhasil dibuat",
      data: result.rows[0]
    });
  } catch (error: any) {
    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        message: "User atau kategori tidak ditemukan"
      });
    }

    console.error("CREATE REPORT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server"
    });
  }
}

export async function getReports(req: Request, res: Response) {
  try {
    const authenticatedReq = req as AuthenticatedRequest;

    if (!authenticatedReq.user) {
      return res.status(401).json({
        success: false,
        message: "Tidak terautentikasi"
      });
    }

    let result;

    if (authenticatedReq.user.role === "warga") {
      result = await pool.query(
        `SELECT *
         FROM public.reports
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [authenticatedReq.user.id]
      );
    } else {
      result = await pool.query(
        `SELECT *
         FROM public.reports
         ORDER BY created_at DESC`
      );
    }

    return res.status(200).json({
      success: true,
      message: "Data laporan berhasil diambil",
      data: result.rows
    });
  } catch (error) {
    console.error("GET REPORTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server"
    });
  }
}

export async function getReportById(req: Request, res: Response) {
  try {
    const authenticatedReq = req as AuthenticatedRequest;

    if (!authenticatedReq.user) {
      return res.status(401).json({
        success: false,
        message: "Tidak terautentikasi"
      });
    }

    const reportId = Number(req.params.id);

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID laporan tidak valid"
      });
    }

    let result;

    if (authenticatedReq.user.role === "warga") {
      result = await pool.query(
        `SELECT r.*, c.name AS category_name
         FROM public.reports r
         LEFT JOIN public.categories c ON c.id = r.category_id
         WHERE r.id = $1 AND r.user_id = $2`,
        [reportId, authenticatedReq.user.id]
      );
    } else {
      result = await pool.query(
        `SELECT r.*, c.name AS category_name
         FROM public.reports r
         LEFT JOIN public.categories c ON c.id = r.category_id
         WHERE r.id = $1`,
        [reportId]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Laporan tidak ditemukan"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Detail laporan berhasil diambil",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("GET REPORT BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server"
    });
  }
}

export async function updateReportStatus(req: Request, res: Response) {
  try {
    const authenticatedReq = req as AuthenticatedRequest;

    if (!authenticatedReq.user) {
      return res.status(401).json({
        success: false,
        message: "Tidak terautentikasi"
      });
    }

    const reportId = Number(req.params.id);

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID laporan tidak valid"
      });
    }

    const statusSchema = z.object({
      status: z.enum([
        "menunggu_verifikasi",
        "diproses",
        "selesai",
        "ditolak"
      ])
    });

    const validation = statusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Status laporan tidak valid",
        errors: validation.error.flatten()
      });
    }

    const result = await pool.query(
      `UPDATE public.reports
       SET status = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [validation.data.status, reportId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Laporan tidak ditemukan"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status laporan berhasil diperbarui",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("UPDATE REPORT STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server"
    });
  }
}

export const assignReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reportId = Number(req.params.id);

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID laporan tidak valid",
      });
    }

    const schema = z.object({
      assigned_to: z.number().int().positive(),
    });

    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Data penugasan tidak valid",
        errors: parsed.error.flatten(),
      });
    }

    const { assigned_to } = parsed.data;

    // Pastikan user yang ditugaskan adalah petugas
    const officerResult = await pool.query(
      `SELECT id, name, role
       FROM public.users
       WHERE id = $1`,
      [assigned_to]
    );

    if (officerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Petugas tidak ditemukan",
      });
    }

    if (officerResult.rows[0].role !== "petugas") {
      return res.status(400).json({
        success: false,
        message: "User yang ditugaskan harus memiliki role petugas",
      });
    }

    // Pastikan laporan tersedia
    const reportResult = await pool.query(
      `SELECT id FROM public.reports WHERE id = $1`,
      [reportId]
    );

    if (reportResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Laporan tidak ditemukan",
      });
    }

    // Assign petugas ke laporan
    const result = await pool.query(
      `UPDATE public.reports
       SET assigned_to = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [assigned_to, reportId]
    );

    return res.status(200).json({
      success: true,
      message: "Petugas berhasil ditugaskan",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Assign report error:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};