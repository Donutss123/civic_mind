
import { Link, useNavigate } from 'react-router-dom'
import { clearSession, getCurrentUser, type AuthUser } from '../services/auth'
import {
  getReports,
  getCategories,
  type ReportData,
  type Category,
} from '../services/report'
import { useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard,
  PlusCircle,
  History,
  UserRound,
  LogOut,
  Bell,
  Search,
  MapPin,
  CalendarDays,
  FileText,
  Clock3,
  Wrench,
  CheckCircle2,
  ArrowUpRight,
  Leaf,
  ShieldCheck,
  UserCheck,
  XCircle,
} from 'lucide-react'

import './DashboardWarga.css'

// Mengubah enam status backend menjadi label yang mudah dipahami warga.
function getStatusLabel(status: string) {
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
    default:
      return status
  }
}

// Mengubah status menjadi class CSS yang sesuai.
function getStatusClass(status: string) {
  switch (status) {
    case 'BARU':
      return 'status-waiting'
    case 'TERVERIFIKASI':
      return 'status-verified'
    case 'DITUGASKAN':
      return 'status-assigned'
    case 'DITANGANI':
      return 'status-progress'
    case 'SELESAI':
      return 'status-done'
    case 'DITOLAK':
      return 'status-rejected'
    default:
      return ''
  }
}

// Mengubah tanggal database menjadi format Indonesia.
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Komponen kartu statistik.
function StatCard({
  title,
  value,
  description,
  icon,
  color,
}: {
  title: string
  value: number
  description: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <article className="dashboard-stat-card">
      <div className={`dashboard-stat-icon ${color}`}>{icon}</div>
      <div className="dashboard-stat-info">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>
    </article>
  )
}

// Halaman utama untuk warga setelah masuk ke CivicMind.
function DashboardWarga() {
  const navigate = useNavigate()

  const [user, setUser] = useState<AuthUser | null>(null)
  const [reports, setReports] = useState<ReportData[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  // Mengambil data pengguna, laporan, dan kategori dari backend.
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const [currentUser, reportData, categoryData] = await Promise.all([
          getCurrentUser(),
          getReports(),
          getCategories(),
        ])

        setUser(currentUser)
        setReports(reportData)
        setCategories(categoryData)
      } catch (error) {
        console.error('Gagal mengambil data dashboard:', error)

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Gagal mengambil data dashboard.'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Menghitung statistik berdasarkan enam status resmi CivicMind.
  const totalReports = reports.length

  const waitingReports = reports.filter(
    (report) => report.status === 'BARU'
  ).length

  const processingReports = reports.filter(
    (report) =>
      report.status === 'TERVERIFIKASI' ||
      report.status === 'DITUGASKAN' ||
      report.status === 'DITANGANI'
  ).length

  const completedReports = reports.filter(
    (report) => report.status === 'SELESAI'
  ).length

  // Membuat daftar kategori agar ID kategori bisa ditampilkan sebagai nama.
  const categoryMap = useMemo(() => {
    return new Map(
      categories.map((category) => [String(category.id), category.name])
    )
  }, [categories])

  // Mengurutkan laporan terbaru dan menerapkan pencarian.
  const filteredReports = useMemo(() => {
    return [...reports]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
      .filter((report) => {
        const categoryName =
          report.category_name ||
          categoryMap.get(String(report.category_id)) ||
          'Kategori'

        const keyword = searchQuery.toLowerCase()

        return (
          report.title.toLowerCase().includes(keyword) ||
          report.location.toLowerCase().includes(keyword) ||
          categoryName.toLowerCase().includes(keyword) ||
          String(report.id).toLowerCase().includes(keyword) ||
          getStatusLabel(report.status).toLowerCase().includes(keyword)
        )
      })
      .slice(0, 5)
  }, [reports, categoryMap, searchQuery])

  // Menghapus sesi pengguna dan kembali ke halaman login.
  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <Link to="/warga/dashboard" className="dashboard-brand">
          <span className="dashboard-brand-icon">
            <Leaf size={22} />
          </span>
          <span>CivicMind</span>
        </Link>

        <div className="dashboard-sidebar-label">MENU UTAMA</div>

        <nav className="dashboard-navigation">
          <Link to="/warga/dashboard" className="dashboard-nav-item active">
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </Link>

          <Link to="/warga/laporan/buat" className="dashboard-nav-item">
            <PlusCircle size={19} />
            <span>Buat Laporan</span>
          </Link>

          <Link to="/warga/riwayat" className="dashboard-nav-item">
            <History size={19} />
            <span>Riwayat Laporan</span>
          </Link>

          <Link to="/warga/profil" className="dashboard-nav-item">
            <UserRound size={19} />
            <span>Profil Saya</span>
          </Link>
        </nav>

        <div className="dashboard-sidebar-bottom">
          <div className="dashboard-help-card">
            <div className="dashboard-help-icon">
              <Leaf size={20} />
            </div>
            <strong>Peduli lingkungan?</strong>
            <p>
              Laporkan masalah di sekitarmu dan bantu lingkungan menjadi
              lebih baik.
            </p>
            <Link to="/warga/laporan/buat">
              Buat laporan <ArrowUpRight size={15} />
            </Link>
          </div>

          <button
            type="button"
            className="dashboard-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-mobile-brand">
            <Leaf size={21} />
            <strong>CivicMind</strong>
          </div>

          <div className="dashboard-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Cari laporan..."
              aria-label="Cari laporan"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="dashboard-topbar-right">
            <button
              type="button"
              className="dashboard-notification"
              aria-label="Notifikasi"
            >
              <Bell size={19} />
              <span />
            </button>

            <div className="dashboard-user">
              <div className="dashboard-avatar">
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <strong>{user?.name || 'Memuat pengguna...'}</strong>
                <small>{user?.role || 'Warga'}</small>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="dashboard-welcome">
            <div>
              <span className="dashboard-eyebrow">DASHBOARD WARGA</span>
              <h1>Halo, {user?.name || 'Warga'}! 👋</h1>
              <p>
                Pantau laporanmu dan ikut berkontribusi untuk lingkungan
                yang lebih baik.
              </p>
            </div>

            <Link
              to="/warga/laporan/buat"
              className="dashboard-create-button"
            >
              <PlusCircle size={18} />
              Buat Laporan
            </Link>
          </section>

          {errorMessage && (
            <div role="alert">
              Gagal memuat data dashboard: {errorMessage}
            </div>
          )}

          <section className="dashboard-stats">
            <StatCard
              title="Total Laporan"
              value={isLoading ? 0 : totalReports}
              description="Semua laporan kamu"
              icon={<FileText size={21} />}
              color="stat-green"
            />
            <StatCard
              title="Menunggu"
              value={isLoading ? 0 : waitingReports}
              description="Menunggu verifikasi"
              icon={<Clock3 size={21} />}
              color="stat-orange"
            />
            <StatCard
              title="Dalam Proses"
              value={isLoading ? 0 : processingReports}
              description="Verifikasi hingga penanganan"
              icon={<Wrench size={21} />}
              color="stat-blue"
            />
            <StatCard
              title="Selesai"
              value={isLoading ? 0 : completedReports}
              description="Berhasil diselesaikan"
              icon={<CheckCircle2 size={21} />}
              color="stat-purple"
            />
          </section>

          <section className="dashboard-report-section">
            <div className="dashboard-section-heading">
              <div>
                <h2>Laporan Terbaru</h2>
                <p>Perkembangan laporan yang pernah kamu buat.</p>
              </div>

              <Link to="/warga/riwayat" className="dashboard-view-all">
                Lihat semua <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="dashboard-report-list">
              {isLoading ? (
                <p>Memuat laporan...</p>
              ) : filteredReports.length === 0 ? (
                <p>
                  {searchQuery
                    ? 'Tidak ada laporan yang cocok dengan pencarian.'
                    : 'Kamu belum memiliki laporan.'}
                </p>
              ) : (
                filteredReports.map((report) => (
                  <article
                    className="dashboard-report-card"
                    key={report.id}
                  >
                    <div className="dashboard-report-symbol">
                      <FileText size={21} />
                    </div>

                    <div className="dashboard-report-info">
                      <div className="dashboard-report-meta">
                        <span>#{report.id}</span>
                        <span
                          className={`dashboard-status ${getStatusClass(report.status)}`}
                        >
                          {getStatusLabel(report.status)}
                        </span>
                      </div>

                      <h3>{report.title}</h3>

                      <div className="dashboard-report-details">
                        <span>
                          {report.category_name ||
                            categoryMap.get(String(report.category_id)) ||
                            'Kategori'}
                        </span>
                        <span>
                          <MapPin size={13} />
                          {report.location}
                        </span>
                        <span>
                          <CalendarDays size={13} />
                          {formatDate(report.created_at)}
                        </span>
                      </div>

                      {/* Alasan penolakan ditampilkan agar warga mengetahui hasil verifikasi. */}
                      {report.status === 'DITOLAK' && report.rejection_reason && (
                        <div className="dashboard-rejection-reason">
                          <XCircle size={15} />
                          <div>
                            <strong>Alasan penolakan</strong>
                            <p>{report.rejection_reason}</p>
                          </div>
                        </div>
                      )}

                      {/* Menampilkan informasi tahap verifikasi dan penugasan. */}
                      {report.status === 'TERVERIFIKASI' && (
                        <div className="dashboard-report-note">
                          <ShieldCheck size={15} />
                          Laporan telah diverifikasi admin.
                        </div>
                      )}

                      {report.status === 'DITUGASKAN' && (
                        <div className="dashboard-report-note">
                          <UserCheck size={15} />
                          Laporan telah ditugaskan kepada petugas.
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/warga/riwayat/${report.id}`}
                      className="dashboard-report-action"
                      aria-label={`Lihat detail ${report.title}`}
                      title="Lihat detail laporan"
                    >
                      <ArrowUpRight size={19} />
                    </Link>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="dashboard-bottom-banner">
            <div className="dashboard-banner-icon">
              <Leaf size={28} />
            </div>
            <div>
              <h2>Perubahan dimulai dari kepedulianmu.</h2>
              <p>
                Menemukan masalah di lingkungan sekitar? Jangan ragu untuk
                melaporkannya.
              </p>
            </div>
            <Link to="/warga/laporan/buat">
              Laporkan Sekarang <ArrowUpRight size={16} />
            </Link>
          </section>
        </div>
      </main>
    </div>
  )
}

export default DashboardWarga
