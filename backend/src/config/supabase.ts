
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// Mengambil kredensial Supabase dari environment backend.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

// Memastikan konfigurasi tersedia sebelum aplikasi menggunakan Supabase.
if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    "SUPABASE_URL dan SUPABASE_SECRET_KEY wajib diatur di file .env"
  );
}

// Client khusus backend untuk mengelola file di Supabase Storage.
export const supabase = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Nama bucket penyimpanan foto CivicMind.
export const STORAGE_BUCKET = "civicmind-photos";
