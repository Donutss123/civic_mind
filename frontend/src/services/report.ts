
const API_URL = 'http://localhost:5000/api'

// Tipe data kategori laporan.
export interface Category {
  id: string
  name: string
  description: string
}

// Tipe data petugas untuk pilihan penugasan admin.
export interface Petugas {
  id: string
  name: string
}

// Data yang dikirim warga saat membuat laporan.
export interface ReportPayload {
  category_id: number
  title: string
  description: string
  location: string
  photo: File
}

// Enam status resmi sesuai alur proposal CivicMind.
export type ReportStatus =
  | 'BARU'
  | 'DITOLAK'
  | 'TERVERIFIKASI'
  | 'DITUGASKAN'
  | 'DITANGANI'
  | 'SELESAI'

// Struktur data laporan dari backend.
export interface ReportData {
  id: string
  user_id: string
  category_id: string
  category_name?: string
  title: string
  description: string
  location: string
  photo_url: string | null
  assigned_to: string | null
  status: ReportStatus
  rejection_reason?: string | null
  verified_by?: string | null
  verified_at?: string | null
  created_at: string
  updated_at: string
}

// Mengambil token sesi pengguna untuk autentikasi API.
function getAuthHeaders() {
  const token = localStorage.getItem('civicmind_token')

  if (!token) {
    throw new Error('Sesi login tidak ditemukan. Silakan login kembali.')
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

// Mengambil kategori aktif dari backend.
export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/categories`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Gagal mengambil kategori.')
  }

  return result.data
}

// Mengambil daftar petugas untuk kebutuhan penugasan admin.
export async function getPetugas(): Promise<Petugas[]> {
  const response = await fetch(`${API_URL}/users/petugas`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Gagal mengambil daftar petugas.')
  }

  return result.data
}

// Mengirim laporan baru beserta foto ke backend.
export async function createReport(payload: ReportPayload) {
  const token = localStorage.getItem('civicmind_token')

  if (!token) {
    throw new Error('Sesi login tidak ditemukan. Silakan login kembali.')
  }

  const formData = new FormData()

  formData.append('category_id', String(payload.category_id))
  formData.append('title', payload.title)
  formData.append('description', payload.description)
  formData.append('location', payload.location)
  formData.append('photo', payload.photo)

  const response = await fetch(`${API_URL}/reports`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Gagal mengirim laporan.')
  }

  return result
}

// Mengambil daftar laporan sesuai hak akses pengguna.
export async function getReports(): Promise<ReportData[]> {
  const response = await fetch(`${API_URL}/reports`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Gagal mengambil data laporan.')
  }

  return result.data
}

// Mengambil detail laporan berdasarkan ID.
export async function getReportById(id: string): Promise<ReportData> {
  const response = await fetch(`${API_URL}/reports/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Gagal mengambil detail laporan.')
  }

  return result.data
}

// Memperbarui status laporan, termasuk alasan jika laporan ditolak.
export async function updateReportStatus(
  id: string,
  status: ReportStatus,
  rejection_reason?: string
): Promise<ReportData> {
  const response = await fetch(`${API_URL}/reports/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      status,
      ...(rejection_reason ? { rejection_reason } : {}),
    }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Gagal memperbarui status laporan.')
  }

  return result.data
}

// Menugaskan laporan terverifikasi kepada petugas.
export async function assignReport(
  id: string,
  assigned_to: number
): Promise<ReportData> {
  const response = await fetch(`${API_URL}/reports/${id}/assign`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ assigned_to }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Gagal menugaskan laporan.')
  }

  return result.data
}
