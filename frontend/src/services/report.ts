
const API_URL = 'http://localhost:5000/api'

export interface Category {
  id: string
  name: string
  description: string
}

export interface ReportPayload {
  category_id: number
  title: string
  description: string
  location: string
  photo_url?: string
}

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
  status: string
  created_at: string
  updated_at: string
}

// Mengambil token sesi pengguna.
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

// Mengirim laporan baru ke backend.
export async function createReport(payload: ReportPayload) {
  const response = await fetch(`${API_URL}/reports`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
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

// Mengambil detail satu laporan berdasarkan ID.
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

// Memperbarui status laporan melalui backend.
export async function updateReportStatus(
  id: string,
  status: 'menunggu_verifikasi' | 'diproses' | 'selesai' | 'ditolak'
): Promise<ReportData> {
  const response = await fetch(`${API_URL}/reports/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Gagal memperbarui status laporan.')
  }

  return result.data
}
