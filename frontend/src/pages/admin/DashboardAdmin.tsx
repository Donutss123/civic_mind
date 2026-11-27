
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Bell,
  Leaf,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  AlertCircle,
  MapPin,
  CalendarDays,
  TrendingUp,
  Menu,
} from 'lucide-react'
import { clearSession, getCurrentUser, type AuthUser } from '../../services/auth'
import {
  getReports,
  getCategories,
  type ReportData,
  type Category,
} from '../../services/report'
import './DashboardAdmin.css'

// Warna untuk membedakan setiap kategori laporan.
const categoryColors = [
  '#07834f',
  '#0e7490',
  '#d97706',
  '#7c3aed',
  '#db5275',
]

// Mengubah status backend menjadi label dashboard.
function getStatusLabel(status: string) {
  switch (status) {
    case 'menunggu_verifikasi':
      return 'BARU'
    case 'diproses':
      return 'DITANGANI'
    case 'selesai':
      return 'SELESAI'
    case 'ditolak':
      return 'DITOLAK'
    default:
      return status.toUpperCase()
  }
}

// Mengubah status menjadi class CSS.
function getStatusClass(status: string) {
  switch (status) {
    case 'menunggu_verifikasi':
      return 'admin-status-new'
    case 'diproses':
      return 'admin-status-progress'
    case 'selesai':
      return 'admin-status-done'
    case 'ditolak':
      return 'admin-status-new'
    default:
      return 'admin-status-new'
  }
}

// Mengubah tanggal menjadi format Indonesia.
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Menghasilkan enam bulan terakhir untuk grafik.
function getLastSixMonths() {
  const now = new Date()

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (5 - index),
      1
    )

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: date.toLocaleDateString('id-ID', { month: 'short' }),
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
    }
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
    <article className="admin-stat-card">
      <div className={`admin-stat-icon ${color}`}>{icon}</div>
      <div className="admin-stat-info">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>
    </article>
  )
}

function DashboardAdmin() {
  const navigate = useNavigate()

  const [user, setUser] = useState<AuthUser | null>(null)
  const [reports, setReports] = useState<ReportData[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  // Mengambil data admin, laporan, dan kategori dari backend.
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
        console.error('Gagal mengambil data dashboard admin:', error)

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

  // Menghitung statistik laporan berdasarkan status database.
  const totalReports = reports.length

  const waitingReports = reports.filter(
    (report) => report.status === 'menunggu_verifikasi'
  ).length

  const processingReports = reports.filter(
    (report) => report.status === 'diproses'
  ).length

  const completedReports = reports.filter(
    (report) => report.status === 'selesai'
  ).length

  // Menghitung jumlah laporan untuk setiap kategori.
  const categoryStats = useMemo(() => {
    return categories.map((category, index) => {
      const count = reports.filter(
        (report) => String(report.category_id) === String(category.id)
      ).length

      const percentage =
        totalReports > 0
          ? Math.round((count / totalReports) * 100)
          : 0

      return {
        name: category.name,
        count,
        percentage,
        color: categoryColors[index % categoryColors.length],
      }
    })
  }, [categories, reports, totalReports])

  // Menyiapkan data enam bulan terakhir.
  const monthlyReports = useMemo(() => {
    const months = getLastSixMonths()

    return months.map((month) => {
      const count = reports.filter((report) => {
        const reportDate = new Date(report.created_at)

        return (
          reportDate.getFullYear() === month.year &&
          reportDate.getMonth() === month.monthIndex
        )
      }).length

      return {
        month: month.month,
        value: count,
      }
    })
  }, [reports])

  // Mengurutkan laporan terbaru berdasarkan waktu pembuatan.
  const recentReports = useMemo(() => {
    return [...reports]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
      .slice(0, 5)
  }, [reports])

  // Membuat diagram donat berdasarkan distribusi kategori.
  const donutBackground = useMemo(() => {
    if (totalReports === 0) {
      return 'conic-gradient(#e5eee9 0% 100%)'
    }

    let currentPercentage = 0

    const segments = categoryStats.map((category) => {
      const start = currentPercentage
      currentPercentage += (category.count / totalReports) * 100

      return `${category.color} ${start}% ${currentPercentage}%`
    })

    return `conic-gradient(${segments.join(', ')})`
  }, [categoryStats, totalReports])

  // Mengubah ID kategori menjadi nama kategori.
  const getCategoryName = (report: ReportData) => {
    if (report.category_name) {
      return report.category_name
    }

    const category = categories.find(
      (item) => String(item.id) === String(report.category_id)
    )

    return category?.name || 'Kategori'
  }

  // Mengakhiri sesi admin.
  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  const currentMonth = new Date().toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/admin/dashboard" className="admin-brand">
          <span className="admin-brand-icon">
            <Leaf size={22} />
          </span>
          <span>CivicMind</span>
        </Link>

        <div className="admin-sidebar-label">MENU ADMIN</div>

        <nav className="admin-navigation">
          <Link to="/admin/dashboard" className="admin-nav-item active">
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </Link>

          <a href="#laporan-terbaru" className="admin-nav-item">
            <FileText size={19} />
            <span>Laporan Masuk</span>
          </a>

          <a href="#ringkasan-kategori" className="admin-nav-item">
            <ClipboardList size={19} />
            <span>Ringkasan Laporan</span>
          </a>

          <a href="#data-admin" className="admin-nav-item">
            <Users size={19} />
            <span>Data Pengguna</span>
          </a>

          <a href="#pengaturan" className="admin-nav-item">
            <Settings size={19} />
            <span>Pengaturan</span>
          </a>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-help-card">
            <div className="admin-help-icon">
              <Leaf size={20} />
            </div>
            <strong>Kelola lingkungan bersama</strong>
            <p>
              Pantau laporan warga dan bantu percepat penanganannya.
            </p>
          </div>

          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Buka navigasi"
          >
            <Menu size={21} />
          </button>

          <div className="admin-mobile-brand">
            <Leaf size={21} />
            <strong>CivicMind</strong>
          </div>

          <div className="admin-topbar-label">
            Panel Administrasi
          </div>

          <div className="admin-topbar-right">
            <button
              type="button"
              className="admin-notification"
              aria-label="Notifikasi"
            >
              <Bell size={19} />
              <span />
            </button>

            <div className="admin-user">
              <div className="admin-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <strong>{user?.name || 'Administrator'}</strong>
                <small>Admin Desa</small>
              </div>
            </div>
          </div>
        </header>

        {mobileMenuOpen && (
          <nav className="admin-mobile-navigation">
            <Link to="/admin/dashboard">Dashboard</Link>
            <a href="#laporan-terbaru">Laporan Masuk</a>
            <a href="#ringkasan-kategori">Ringkasan Laporan</a>
            <a href="#data-admin">Data Pengguna</a>
            <button type="button" onClick={handleLogout}>
              Keluar
            </button>
          </nav>
        )}

        <div className="admin-content">
          <section className="admin-welcome">
            <div>
              <span className="admin-eyebrow">ADMINISTRASI DESA</span>
              <h1>Dashboard Admin 👋</h1>
              <p>
                Pantau laporan warga dan perkembangan penanganan
                masalah di lingkungan desa.
              </p>
            </div>

            <div className="admin-date-badge">
              <CalendarDays size={17} />
              <span>{currentMonth}</span>
            </div>
          </section>

          {errorMessage && (
            <div role="alert">
              Gagal memuat data dashboard: {errorMessage}
            </div>
          )}

          <section className="admin-stats">
            <StatCard
              title="Total Laporan"
              value={isLoading ? 0 : totalReports}
              description="Seluruh laporan masuk"
              icon={<FileText size={21} />}
              color="admin-stat-green"
            />
            <StatCard
              title="Menunggu Verifikasi"
              value={isLoading ? 0 : waitingReports}
              description="Perlu pemeriksaan admin"
              icon={<Clock3 size={21} />}
              color="admin-stat-orange"
            />
            <StatCard
              title="Sedang Ditangani"
              value={isLoading ? 0 : processingReports}
              description="Dalam proses petugas"
              icon={<TrendingUp size={21} />}
              color="admin-stat-blue"
            />
            <StatCard
              title="Selesai"
              value={isLoading ? 0 : completedReports}
              description="Penanganan diselesaikan"
              icon={<CheckCircle2 size={21} />}
              color="admin-stat-purple"
            />
          </section>

          <section className="admin-chart-grid">
            <article className="admin-panel admin-monthly-panel">
              <div className="admin-panel-heading">
                <div>
                  <h2>Grafik Laporan</h2>
                  <p>Jumlah laporan selama enam bulan terakhir</p>
                </div>
                <span className="admin-panel-tag">6 Bulan</span>
              </div>

              <div className="admin-bar-chart">
                <div className="admin-chart-y-axis">
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>
                </div>

                <div className="admin-chart-bars">
                  {monthlyReports.map((item) => (
                    <div className="admin-chart-column" key={item.month}>
                      <div className="admin-chart-bar-area">
                        <div
                          className="admin-chart-bar"
                          style={{
                            height: `${Math.min(item.value, 100)}%`,
                          }}
                          title={`${item.value} laporan`}
                        />
                      </div>
                      <span>{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article
              className="admin-panel admin-category-panel"
              id="ringkasan-kategori"
            >
              <div className="admin-panel-heading">
                <div>
                  <h2>Kategori Laporan</h2>
                  <p>Distribusi laporan berdasarkan kategori</p>
                </div>
              </div>

              <div className="admin-category-content">
                <div
                  className="admin-donut"
                  role="img"
                  aria-label="Diagram distribusi kategori laporan"
                  style={{ background: donutBackground }}
                >
                  <div className="admin-donut-center">
                    <strong>{isLoading ? 0 : totalReports}</strong>
                    <span>Laporan</span>
                  </div>
                </div>

                <div className="admin-category-legend">
                  {categoryStats.map((category) => (
                    <div
                      className="admin-category-item"
                      key={category.name}
                    >
                      <span
                        className="admin-category-dot"
                        style={{ background: category.color }}
                      />
                      <span className="admin-category-name">
                        {category.name}
                      </span>
                      <strong>{category.percentage}%</strong>
                    </div>
                  ))}

                  {!isLoading && categoryStats.length === 0 && (
                    <p>Belum ada data kategori.</p>
                  )}
                </div>
              </div>
            </article>
          </section>

          <section
            className="admin-panel admin-recent-panel"
            id="laporan-terbaru"
          >
            <div className="admin-panel-heading">
              <div>
                <h2>Laporan Terbaru</h2>
                <p>Daftar laporan yang baru diterima dari warga.</p>
              </div>
              <span className="admin-view-all">
                Total {totalReports} laporan
              </span>
            </div>

            <div className="admin-report-list">
              {isLoading ? (
                <p>Memuat laporan...</p>
              ) : recentReports.length === 0 ? (
                <p>Belum ada laporan yang masuk.</p>
              ) : (
                recentReports.map((report) => (
                  <article className="admin-report-card" key={report.id}>
                    <div className="admin-report-icon">
                      <FileText size={21} />
                    </div>

                    <div className="admin-report-info">
                      <div className="admin-report-meta">
                        <span>#{report.id}</span>
                        <span
                          className={`admin-status ${getStatusClass(report.status)}`}
                        >
                          {getStatusLabel(report.status)}
                        </span>
                      </div>

                      <h3>{report.title}</h3>

                      <div className="admin-report-details">
                        <span>{getCategoryName(report)}</span>
                        <span>
                          <MapPin size={13} />
                          {report.location}
                        </span>
                        <span>
                          <CalendarDays size={13} />
                          {formatDate(report.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="admin-report-arrow">
                      <ArrowUpRight size={19} />
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="admin-bottom-note">
            <div className="admin-note-icon">
              <AlertCircle size={21} />
            </div>
            <div>
              <strong>Informasi data dashboard</strong>
              <p>
                Statistik, grafik, distribusi kategori, dan daftar laporan
                ditampilkan berdasarkan data laporan yang tersimpan
                di database.
              </p>
            </div>
          </section>

          <footer className="admin-footer">
            <Leaf size={16} />
            <span>CivicMind — Smart Community Platform</span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default DashboardAdmin
