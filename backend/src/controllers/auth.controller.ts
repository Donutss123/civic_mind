import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/database";
import { z } from "zod";

// ==================== VALIDATION ====================

const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter")
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi")
});

// ==================== REGISTER ====================

export async function register(req: Request, res: Response) {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Data registrasi tidak valid",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    const { name, email, password } = parsed.data;

    // Check email
    const existing = await pool.query(
      "SELECT id FROM public.users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar"
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user
    const result = await pool.query(
      `INSERT INTO public.users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'warga')
       RETURNING id, name, email, role`,
      [name, email, passwordHash]
    );

    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: result.rows[0]
    });

  } catch (error: any) {
    // Handle duplicate email race condition
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar"
      });
    }

    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server"
    });
  }
}

// ==================== LOGIN ====================

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Data login tidak valid",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    const { email, password } = parsed.data;

    // Find user
    const result = await pool.query(
      `SELECT id, name, email, password_hash, role
       FROM public.users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah"
      });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah"
      });
    }

    // Verify JWT secret
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET belum dikonfigurasi");

      return res.status(500).json({
        success: false,
        message: "Konfigurasi server bermasalah"
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      jwtSecret,
      { expiresIn: "1d" }
    );

    // Response
    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server"
    });
  }
}

// ==================== GET CURRENT USER ====================

export async function getMe(req: Request, res: Response) {
  try {
    const authenticatedReq = req as AuthenticatedRequest;

    if (!authenticatedReq.user) {
      return res.status(401).json({
        success: false,
        message: "Tidak terautentikasi"
      });
    }

    const result = await pool.query(
      `SELECT id, name, email, role
       FROM public.users
       WHERE id = $1`,
      [authenticatedReq.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data user berhasil diambil",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("GET ME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server"
    });
  }
}