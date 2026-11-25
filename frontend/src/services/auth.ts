
// Tipe data pengguna yang dikirim backend setelah login.
export interface AuthUser {
  id: number | string
  name: string
  email: string
  role: 'warga' | 'admin' | 'petugas'
}

// Tipe respons dari endpoint registrasi.
interface RegisterResponse {
  success: boolean
  message: string
  data?: AuthUser
}

// Tipe respons dari endpoint login.
interface LoginResponse {
  success: boolean
  message: string
  token?: string
  user?: AuthUser
}

// Mengambil alamat backend dari konfigurasi environment frontend.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Fungsi untuk membaca pesan error dari backend.
async function readError(response: Response): Promise<string> {
  const result = await response.json().catch(() => null)
  return result?.message || 'Terjadi kesalahan saat menghubungi server.'
}

// Mengirim data pendaftaran warga ke backend.
export async function registerUser(data: {
  name: string
  email: string
  password: string
}): Promise<RegisterResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(await readError(response))
  }

  return response.json()
}

// Mengirim email dan password untuk autentikasi pengguna.
export async function loginUser(data: {
  email: string
  password: string
}): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(await readError(response))
  }

  return response.json()
}

// Menyimpan token dan informasi pengguna setelah login berhasil.
export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem('civicmind_token', token)
  localStorage.setItem('civicmind_user', JSON.stringify(user))
}
