
export type ReportStatus =
  | 'BARU'
  | 'DITOLAK'
  | 'TERVERIFIKASI'
  | 'DITUGASKAN'
  | 'DITANGANI'
  | 'SELESAI'

export interface Report {
  id: string
  title: string
  category: string
  location: string
  date: string
  status: ReportStatus
  rejectionReason?: string
}

export const reports: Report[] = [
  {
    id: 'LAP-001',
    title: 'Sampah menumpuk di pinggir jalan',
    category: 'Kebersihan',
    location: 'Jl. Melati, RT 02',
    date: '24 November 2026',
    status: 'BARU',
  },
  {
    id: 'LAP-002',
    title: 'Jalan berlubang dekat balai warga',
    category: 'Infrastruktur',
    location: 'Jl. Mawar, RT 04',
    date: '22 November 2026',
    status: 'DITANGANI',
  },
  {
    id: 'LAP-003',
    title: 'Lampu penerangan jalan tidak menyala',
    category: 'Fasilitas Umum',
    location: 'Jl. Kenanga, RT 01',
    date: '19 November 2026',
    status: 'SELESAI',
  },
  {
    id: 'LAP-004',
    title: 'Saluran air tersumbat',
    category: 'Lingkungan',
    location: 'Jl. Anggrek, RT 03',
    date: '17 November 2026',
    status: 'TERVERIFIKASI',
  },
  {
    id: 'LAP-005',
    title: 'Kerusakan fasilitas taman',
    category: 'Fasilitas Umum',
    location: 'Taman RW 05',
    date: '15 November 2026',
    status: 'DITUGASKAN',
  },
  {
    id: 'LAP-006',
    title: 'Laporan duplikat kerusakan jalan',
    category: 'Infrastruktur',
    location: 'Jl. Mawar, RT 04',
    date: '12 November 2026',
    status: 'DITOLAK',
    rejectionReason: 'Laporan serupa sudah tercatat sebelumnya.',
  },
]
