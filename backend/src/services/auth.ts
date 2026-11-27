
const API_URL = 'http://localhost:5000/api'

interface User {
  id: string
  name: string
  email: string
  role: 'warga' | 'petugas' | 'admin'
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  name: string
  email: string
  password: string
}

interface LoginResponse {
  token: string
  user: User
}

// Mengirim request autentikasi ke backend.
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Terjadi kesalahan server.')
  }

  return result
}

// Mendaftarkan akun warga baru.
export async function registerUser(payload: RegisterPayload) {
  return request<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Login dan mengambil token autentikasi.
export async function loginUser(payload: LoginPayload) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Menyimpan token dan informasi pengguna.
export function saveSession(token: string, user: User) {
  localStorage.setItem('civicmind_token', token)
  localStorage.setItem('civicmind_user', JSON.stringify(user))
}

// Mengambil token autentikasi.
export function getToken() {
  return localStorage.getItem('civicmind_token')
}

// Mengambil informasi pengguna dari penyimpanan lokal.
export function getStoredUser(): User | null {
  const user = localStorage.getItem('civicmind_user')

  if (!user) return null

  try {
    return JSON.parse(user) as User
  } catch {
    localStorage.removeItem('civicmind_user')
    return null
  }
}

// Mengambil profil pengguna terbaru dari backend.
export async function getCurrentUser() {
  return request<User>('/auth/me', {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  })
}

// Menghapus sesi pengguna.
export function logoutUser() {
  localStorage.removeItem('civicmind_token')
  localStorage.removeItem('civicmind_user')
}
