
import { randomUUID } from "crypto";
import sharp from "sharp";
import { supabase, STORAGE_BUCKET } from "../config/supabase";
import { Express } from "express";

// Mengompres dan mengunggah foto laporan ke Supabase Storage.
export async function uploadReportPhoto(file: Express.Multer.File) {
  const compressedPhoto = await sharp(file.buffer)
    .rotate()
    .jpeg({ quality: 80 })
    .toBuffer();

  const filePath = `reports/${randomUUID()}.jpg`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, compressedPhoto, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  // Simpan path file, bukan URL publik, karena bucket bersifat privat.
  return filePath;
}

// Menghapus foto jika proses penyimpanan laporan gagal.
export async function deleteReportPhoto(filePath: string) {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error("GAGAL MENGHAPUS FOTO:", error);
  }
}


// Membuat URL sementara agar foto dari bucket privat bisa ditampilkan.
export async function getReportPhotoUrl(filePath: string) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(filePath, 3600);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}
