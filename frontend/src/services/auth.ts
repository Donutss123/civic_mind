
// Tipe data pengguna yang dikirim backend.
export interface AuthUser {
  id: number | string
  name: string
  email: string
  role: 'warga' | 'admin' | 'petugas'
}

// Tipe respons endpoint registrasi.
interface RegisterResponse {
  success: boolean
  message: string
  data?: AuthUser
}

// Tipe respons endpoint login.
interface LoginResponse {
  success: boolean
  message: string
  data?: {
    token: string
    user: AuthUser
  }
}

// Tipe respons endpoint pemeriksaan sesi.
interface CurrentUserResponse {
  success: boolean
  message: string
  data: AuthUser
}

// Alamat backend dari konfigurasi environment frontend.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Membaca pesan error dari backend.
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

// Mengirim email dan password untuk login.
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

// Menyimpan token dan informasi pengguna setelah login.
export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem('civicmind_token', token)
  localStorage.setItem('civicmind_user', JSON.stringify(user))
}

// Mengambil token yang tersimpan.
export function getToken(): string | null {
  return localStorage.getItem('civicmind_token')
}

// Menghapus sesi pengguna.
export function clearSession() {
  localStorage.removeItem('civicmind_token')
  localStorage.removeItem('civicmind_user')
}

// Memeriksa token dan mengambil data pengguna dari backend.
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getToken()

  if (!token) {
    return null
  }

  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  // Token tidak valid atau sudah kedaluwarsa.
  if (response.status === 401) {
    clearSession()
    return null
  }

  if (!response.ok) {
    throw new Error(await readError(response))
  }

  const result: CurrentUserResponse = await response.json()

  // Memperbarui data pengguna berdasarkan respons backend.
  localStorage.setItem('civicmind_user', JSON.stringify(result.data))

  return result.data
}
