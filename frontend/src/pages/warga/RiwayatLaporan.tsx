
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  PlusCircle,
  Search,
  XCircle,
  Leaf,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import {
  getReports,
  getCategories,
  type ReportData,
  type Category,
} from '../../services/report'
import './RiwayatLaporan.css'

type ReportStatus =
  | 'BARU'
  | 'TERVERIFIKASI'
  | 'DITUGASKAN'
  | 'DITANGANI'
  | 'SELESAI'
  | 'DITOLAK'

type FilterStatus = 'SEMUA' | ReportStatus

interface HistoryReport {
  id: string
  title: string
  category: string
  location: string
  date: string
  status: ReportStatus
  rejection_reason?: string | null
}

const filters: FilterStatus[] = [
  'SEMUA',
  'BARU',
  'TERVERIFIKASI',
  'DITUGASKAN',
  'DITANGANI',
  'SELESAI',
  'DITOLAK',
]

// Mengubah status backend menjadi status yang digunakan frontend.
function mapReportStatus(status: string): ReportStatus {
  switch (status) {
    case 'BARU':
    case 'TERVERIFIKASI':
    case 'DITUGASKAN':
    case 'DITANGANI':
    case 'SELESAI':
    case 'DITOLAK':
      return status
    default:
      return 'BARU'
  }
}

// Mengubah kode status menjadi label yang mudah dipahami warga.
function getStatusLabel(status: ReportStatus): string {
  switch (status) {
    case 'BARU':
      return 'Menunggu Verifikasi'
    case 'TERVERIFIKASI':
      return 'Terverifikasi'
    case 'DITUGASKAN':
      return 'Menunggu Petugas'
    case 'DITANGANI':
      return 'Sedang Ditangani'
    case 'SELESAI':
      return 'Selesai'
    case 'DITOLAK':
      return 'Ditolak'
  }
}

// Mengambil class CSS berdasarkan status laporan.
function getStatusClass(status: ReportStatus) {
  switch (status) {
    case 'BARU':
      return 'history-status-new'
    case 'TERVERIFIKASI':
      return 'history-status-verified'
    case 'DITUGASKAN':
      return 'history-status-assigned'
    case 'DITANGANI':
      return 'history-status-progress'
    case 'SELESAI':
      return 'history-status-done'
    case 'DITOLAK':
      return 'history-status-rejected'
  }
}

// Mengambil ikon berdasarkan status laporan.
function getStatusIcon(status: ReportStatus) {
  switch (status) {
    case 'BARU':
      return <Clock3 size={15} />
    case 'TERVERIFIKASI':
      return <ShieldCheck size={15} />
    case 'DITUGASKAN':
      return <UserCheck size={15} />
    case 'DITANGANI':
      return <Clock3 size={15} />
    case 'SELESAI':
      return <CheckCircle2 size={15} />
    case 'DITOLAK':
      return <XCircle size={15} />
  }
}

// Mengubah tanggal backend menjadi format Indonesia.
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function RiwayatLaporan() {
  const [reports, setReports] = useState<HistoryReport[]>([])
  const [activeFilter, setActiveFilter] =
    useState<FilterStatus>('SEMUA')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  // Mengambil laporan dan kategori dari backend.
  useEffect(() => {
    let isMounted = true

    const fetchReports = async () => {
      try {
        const [reportData, categoryData] = await Promise.all([
          getReports(),
          getCategories(),
        ])

        if (!isMounted) return

        // Membuat pemetaan ID kategori ke nama kategori.
        const categoryMap = new Map<string, string>(
          categoryData.map((category: Category) => [
            String(category.id),
            category.name,
          ]),
        )

        // Mengubah response backend menjadi data tampilan.
        const formattedReports: HistoryReport[] = reportData.map(
          (report: ReportData) => ({
            id: String(report.id),
            title: report.title,
            category:
              categoryMap.get(String(report.category_id)) || 'Lainnya',
            location: report.location,
            date: formatDate(report.created_at),
            status: mapReportStatus(report.status),
            rejection_reason: report.rejection_reason,
          }),
        )

        setReports(formattedReports)
      } catch (error) {
        if (isMounted) {
          setMessage(
            error instanceof Error
              ? error.message
              : 'Gagal mengambil data laporan.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchReports()

    return () => {
      isMounted = false
    }
  }, [])

  // Menghitung laporan berdasarkan filter dan pencarian.
  const filteredReports = reports.filter((report) => {
    const matchesFilter =
      activeFilter === 'SEMUA' || report.status === activeFilter

    const searchText = search.toLowerCase()

    const matchesSearch =
      report.title.toLowerCase().includes(searchText) ||
      report.id.toLowerCase().includes(searchText) ||
      report.category.toLowerCase().includes(searchText) ||
      report.location.toLowerCase().includes(searchText) ||
      getStatusLabel(report.status).toLowerCase().includes(searchText)

    return matchesFilter && matchesSearch
  })

  return (
    <main className="history-page">
      <div className="history-container">
        <header className="history-header">
          <Link to="/warga/dashboard" className="history-brand">
            <span className="history-brand-icon">
              <Leaf size={22} />
            </span>
            <strong>CivicMind</strong>
          </Link>

          <Link to="/warga/dashboard" className="history-back">
            <ArrowLeft size={17} />
            Dashboard
          </Link>
        </header>

        <section className="history-heading">
          <div>
            <span className="history-eyebrow">PANTAU LAPORANMU</span>
            <h1>Riwayat Laporan</h1>
            <p>
              Lihat seluruh laporan yang pernah kamu sampaikan
              dan perkembangan penanganannya.
            </p>
          </div>

          <Link to="/warga/laporan/buat" className="history-create-button">
            <PlusCircle size={18} />
            Buat Laporan
          </Link>
        </section>

        <section className="history-summary">
          <div className="history-summary-icon">
            <FileText size={22} />
          </div>
          <div>
            <span>Total laporan</span>
            <strong>{reports.length}</strong>
          </div>
          <div className="history-summary-note">
            Data laporan dari database CivicMind
          </div>
        </section>

        <section className="history-list-section">
          <div className="history-section-heading">
            <div>
              <h2>Semua Laporan</h2>
              <p>Gunakan filter untuk melihat status laporan.</p>
            </div>
          </div>

          <div className="history-search">
            <Search size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari judul, kategori, atau lokasi..."
              aria-label="Cari laporan"
            />
          </div>

          <div className="history-filters" aria-label="Filter status laporan">
            {filters.map((filter) => (
              <button
                type="button"
                key={filter}
                className={`history-filter ${
                  activeFilter === filter ? 'active' : ''
                }`}
                aria-pressed={activeFilter === filter}
                onClick={() => setActiveFilter(filter)}
              >
                {filter === 'SEMUA'
                  ? 'Semua'
                  : getStatusLabel(filter)}
              </button>
            ))}
          </div>

          <div className="history-results">
            <span>
              Menampilkan <strong>{filteredReports.length}</strong> laporan
            </span>
          </div>

          <div className="history-report-list">
            {isLoading ? (
              <div className="history-empty">
                <div>
                  <Clock3 size={27} />
                </div>
                <strong>Memuat laporan...</strong>
                <p>Mohon tunggu sebentar.</p>
              </div>
            ) : message ? (
              <div className="history-empty">
                <div>
                  <XCircle size={27} />
                </div>
                <strong>Gagal mengambil laporan</strong>
                <p>{message}</p>
              </div>
            ) : filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <Link
                  to={`/warga/riwayat/${report.id}`}
                  className="history-report-card"
                  key={report.id}
                  aria-label={`Lihat detail ${report.title}`}
                >
                  <div className="history-report-icon">
                    <FileText size={22} />
                  </div>

                  <div className="history-report-content">
                    <div className="history-report-top">
                      <span className="history-report-id">
                        #{report.id}
                      </span>
                      <span
                        className={`history-status ${getStatusClass(report.status)}`}
                      >
                        {getStatusIcon(report.status)}
                        {getStatusLabel(report.status)}
                      </span>
                    </div>

                    <h3>{report.title}</h3>

                    <div className="history-report-details">
                      <span>{report.category}</span>
                      <span>
                        <MapPin size={14} />
                        {report.location}
                      </span>
                      <span>
                        <CalendarDays size={14} />
                        {report.date}
                      </span>
                    </div>

                    {/* Menampilkan alasan jika laporan ditolak admin. */}
                    {report.status === 'DITOLAK' &&
                      report.rejection_reason && (
                        <div className="history-rejection-reason">
                          <strong>Alasan penolakan:</strong>
                          <p>{report.rejection_reason}</p>
                        </div>
                      )}
                  </div>

                  <div className="history-report-arrow">
                    <ArrowUpRight size={19} />
                  </div>
                </Link>
              ))
            ) : (
              <div className="history-empty">
                <div>
                  <FileText size={27} />
                </div>
                <strong>Laporan tidak ditemukan</strong>
                <p>
                  Coba ubah kata pencarian atau pilih filter status lainnya.
                </p>
              </div>
            )}
          </div>
        </section>

        <footer className="history-footer">
          <Leaf size={16} />
          <span>Bersama membangun lingkungan yang lebih baik.</span>
        </footer>
      </div>
    </main>
  )
}

export default RiwayatLaporan
