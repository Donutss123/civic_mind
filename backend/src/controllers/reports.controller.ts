
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

const reportStatusSchema = z.object({
  status: z.enum([
    "TERVERIFIKASI",
    "DITOLAK",
    "DITANGANI",
    "SELESAI"
  ]),
  rejection_reason: z.string().trim().min(5).optional()
});

const assignReportSchema = z.object({
  assigned_to: z.number().int().positive()
});

// Membuat laporan baru dari warga yang sedang login.
export async function createReport(req: Request, res: Response) {
  try {
    const authenticatedReq = req as AuthenticatedRequest;

    if (!authenticatedReq.user) {
      return res.status(401).json({
        success: false,
        message: "Tidak terautentikasi"
      });
    }

    if (authenticatedReq.user.role !== "warga") {
      return res.status(403).json({
        success: false,
        message: "Hanya warga yang dapat membuat laporan"
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
        (user_id, category_id, title, description, location, photo_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'BARU')
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

// Mengambil laporan sesuai hak akses pengguna.
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
        `SELECT r.*, c.name AS category_name
         FROM public.reports r
         LEFT JOIN public.categories c ON c.id = r.category_id
         WHERE r.user_id = $1
         ORDER BY r.created_at DESC`,
        [authenticatedReq.user.id]
      );
    } else if (authenticatedReq.user.role === "petugas") {
      result = await pool.query(
        `SELECT r.*, c.name AS category_name
         FROM public.reports r
         LEFT JOIN public.categories c ON c.id = r.category_id
         WHERE r.assigned_to = $1
         ORDER BY r.created_at DESC`,
        [authenticatedReq.user.id]
      );
    } else if (authenticatedReq.user.role === "admin") {
      result = await pool.query(
        `SELECT r.*, c.name AS category_name
         FROM public.reports r
         LEFT JOIN public.categories c ON c.id = r.category_id
         ORDER BY r.created_at DESC`
      );
    } else {
      return res.status(403).json({
        success: false,
        message: "Tidak memiliki akses"
      });
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

// Mengambil detail laporan sesuai hak akses pengguna.
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
    } else if (authenticatedReq.user.role === "petugas") {
      result = await pool.query(
        `SELECT r.*, c.name AS category_name
         FROM public.reports r
         LEFT JOIN public.categories c ON c.id = r.category_id
         WHERE r.id = $1 AND r.assigned_to = $2`,
        [reportId, authenticatedReq.user.id]
      );
    } else if (authenticatedReq.user.role === "admin") {
      result = await pool.query(
        `SELECT r.*, c.name AS category_name
         FROM public.reports r
         LEFT JOIN public.categories c ON c.id = r.category_id
         WHERE r.id = $1`,
        [reportId]
      );
    } else {
      return res.status(403).json({
        success: false,
        message: "Tidak memiliki akses"
      });
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

// Memverifikasi, menolak, atau memperbarui progres laporan.
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

    const validation = reportStatusSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Data perubahan status tidak valid",
        errors: validation.error.flatten()
      });
    }

    const { status, rejection_reason } = validation.data;
    let result;

    if (authenticatedReq.user.role === "admin") {
      if (status !== "TERVERIFIKASI" && status !== "DITOLAK") {
        return res.status(403).json({
          success: false,
          message: "Admin hanya dapat memverifikasi atau menolak laporan"
        });
      }

      if (status === "DITOLAK" && !rejection_reason) {
        return res.status(400).json({
          success: false,
          message: "Alasan penolakan wajib diisi"
        });
      }

      if (status === "TERVERIFIKASI" && rejection_reason) {
        return res.status(400).json({
          success: false,
          message: "Alasan penolakan tidak diperlukan untuk verifikasi"
        });
      }

      if (status === "TERVERIFIKASI") {
        result = await pool.query(
          `UPDATE public.reports
           SET status = 'TERVERIFIKASI',
               verified_by = $1,
               verified_at = NOW(),
               rejection_reason = NULL,
               updated_at = NOW()
           WHERE id = $2 AND status = 'BARU'
           RETURNING *`,
          [authenticatedReq.user.id, reportId]
        );
      } else {
        result = await pool.query(
          `UPDATE public.reports
           SET status = 'DITOLAK',
               rejection_reason = $1,
               verified_by = $2,
               verified_at = NOW(),
               updated_at = NOW()
           WHERE id = $3 AND status = 'BARU'
           RETURNING *`,
          [rejection_reason, authenticatedReq.user.id, reportId]
        );
      }
    } else if (authenticatedReq.user.role === "petugas") {
      if (status !== "DITANGANI" && status !== "SELESAI") {
        return res.status(403).json({
          success: false,
          message: "Petugas hanya dapat mengubah progres penanganan"
        });
      }

      if (rejection_reason) {
        return res.status(400).json({
          success: false,
          message: "Petugas tidak dapat mengisi alasan penolakan"
        });
      }

      const previousStatus =
        status === "DITANGANI" ? "DITUGASKAN" : "DITANGANI";

      result = await pool.query(
        `UPDATE public.reports
         SET status = $1,
             updated_at = NOW()
         WHERE id = $2
           AND assigned_to = $3
           AND status = $4
         RETURNING *`,
        [
          status,
          reportId,
          authenticatedReq.user.id,
          previousStatus
        ]
      );
    } else {
      return res.status(403).json({
        success: false,
        message: "Tidak memiliki akses untuk mengubah status laporan"
      });
    }

    if (result.rows.length === 0) {
      return res.status(409).json({
        success: false,
        message: "Laporan tidak ditemukan atau status sebelumnya tidak sesuai alur"
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

// Menugaskan laporan terverifikasi kepada petugas oleh admin.
export const assignReport = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Tidak terautentikasi"
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Hanya admin yang dapat menugaskan laporan"
      });
    }

    const reportId = Number(req.params.id);

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID laporan tidak valid"
      });
    }

    const parsed = assignReportSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Data penugasan tidak valid",
        errors: parsed.error.flatten()
      });
    }

    const { assigned_to } = parsed.data;

    const officerResult = await pool.query(
      `SELECT id, name
       FROM public.users
       WHERE id = $1 AND role = 'petugas'`,
      [assigned_to]
    );

    if (officerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Petugas tidak ditemukan"
      });
    }

    const result = await pool.query(
      `UPDATE public.reports
       SET assigned_to = $1,
           status = 'DITUGASKAN',
           updated_at = NOW()
       WHERE id = $2
         AND status = 'TERVERIFIKASI'
       RETURNING *`,
      [assigned_to, reportId]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({
        success: false,
        message: "Laporan tidak ditemukan atau belum terverifikasi"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Petugas berhasil ditugaskan",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("ASSIGN REPORT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server"
    });
  }
};
