import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// ==================== TYPES ====================

export type UserRole = "warga" | "petugas" | "admin";

export interface AuthenticatedUser {
  id: number | string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// ==================== AUTH MIDDLEWARE ====================

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    // Check Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token autentikasi diperlukan"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan"
      });
    }

    // Check JWT secret
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET belum dikonfigurasi");

      return res.status(500).json({
        success: false,
        message: "Konfigurasi server bermasalah"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("id" in decoded) ||
      !("role" in decoded)
    ) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid"
      });
    }

    const { id, role } = decoded;

    // Validate payload
    if (
      (typeof id !== "number" && typeof id !== "string") ||
      !["warga", "petugas", "admin"].includes(role as string)
    ) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid"
      });
    }

    // Attach user information to request
    (req as AuthenticatedRequest).user = {
      id,
      role: role as UserRole
    };

    next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token sudah expired"
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid"
      });
    }

    console.error("AUTH MIDDLEWARE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server"
    });
  }
}

export function authorizeRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authenticatedReq = req as AuthenticatedRequest;

    if (!authenticatedReq.user) {
      return res.status(401).json({
        success: false,
        message: "Tidak terautentikasi"
      });
    }

    if (!allowedRoles.includes(authenticatedReq.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke fitur ini"
      });
    }

    next();
  };
}