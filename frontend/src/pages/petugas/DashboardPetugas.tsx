
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  LogOut,
  Bell,
  Leaf,
  Clock3,
  CheckCircle2,
  TrendingUp,
  MapPin,
  CalendarDays,
  ArrowUpRight,
  Menu,
  RefreshCw,
} from 'lucide-react'

import { clearSession, getCurrentUser, type AuthUser } from '../../services/auth'
import {
  getReports,
  updateReportStatus,
  type ReportData,
} from '../../services/report'

import './DashboardPetugas.css'

// Mengubah status backend menjadi label dashboard.
function getStatusLabel(status: string) {
  switch (status) {
    case 'BARU':
      return 'BARU'
    case 'TERVERIFIKASI':
      return 'TERVERIFIKASI'
    case 'DITUGASKAN':
      return 'DITUGASKAN'
    case 'DITANGANI':
      return 'DITANGANI'
    case 'SELESAI':
      return 'SELESAI'
    case 'DITOLAK':
      return 'DITOLAK'
    default:
      return status.toUpperCase()
  }
}

// Mengubah status menjadi class CSS.
function getStatusClass(status: string) {
  switch (status) {
    case 'BARU':
    case 'DITOLAK':
      return 'admin-status-new'
    case 'TERVERIFIKASI':
    case 'DITUGASKAN':
      return 'admin-status-progress'
    case 'DITANGANI':
      return 'admin-status-progress'
    case 'SELESAI':
      return 'admin-status-done'
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

function DashboardPetugas() {
  const navigate = useNavigate()

  const [user, setUser] = useState<AuthUser | null>(null)
  const [reports, setReports] = useState<ReportData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Mengambil data petugas dan laporan tugasnya.
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const [currentUser, reportData] = await Promise.all([
        getCurrentUser(),
        getReports(),
      ])

      if (!currentUser || currentUser.role !== 'petugas') {
        throw new Error('Akun ini bukan akun petugas.')
      }

      setUser(currentUser)
      setReports(reportData)
    } catch (error) {
      console.error('Gagal mengambil dashboard petugas:', error)

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data dashboard.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Menghitung statistik tugas berdasarkan status.
  const totalReports = reports.length

  const waitingReports = reports.filter(
    (report) => report.status === 'DITUGASKAN'
  ).length

  const processingReports = reports.filter(
    (report) => report.status === 'DITANGANI'
  ).length

  const completedReports = reports.filter(
    (report) => report.status === 'SELESAI'
  ).length

  // Mengurutkan laporan terbaru.
  const sortedReports = useMemo(() => {
    return [...reports].sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
  }, [reports])

  // Memperbarui status laporan yang ditugaskan.
  const handleUpdateStatus = async (
    reportId: string,
    status: 'DITANGANI' | 'SELESAI'
  ) => {
    try {
      setUpdatingId(reportId)
      setErrorMessage('')
      setSuccessMessage('')

      await updateReportStatus(reportId, status)

      setSuccessMessage(
        status === 'DITANGANI'
          ? 'Laporan berhasil mulai ditangani.'
          : 'Laporan berhasil diselesaikan.'
      )

      // Memuat ulang data agar sesuai dengan database.
      await fetchDashboardData()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Gagal memperbarui status laporan.'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  // Mengakhiri sesi petugas.
  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-layout petugas-layout">
      <aside className="admin-sidebar">
        <Link to="/petugas/dashboard" className="admin-brand">
          <span className="admin-brand-icon">
            <Leaf size={22} />
          </span>
          <span>CivicMind</span>
        </Link>

        <div className="admin-sidebar-label">MENU PETUGAS</div>

        <nav className="admin-navigation">
          <Link
            to="/petugas/dashboard"
            className="admin-nav-item active"
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </Link>

          <a href="#daftar-tugas" className="admin-nav-item">
            <FileText size={19} />
            <span>Laporan Tugas</span>
          </a>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-help-card">
            <div className="admin-help-icon">
              <Leaf size={20} />
            </div>
            <strong>Kerja nyata untuk lingkungan</strong>
            <p>
              Tindak lanjuti laporan warga dan bantu selesaikan
              permasalahan di lingkungan.
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
            Panel Petugas
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
                {user?.name?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div>
                <strong>{user?.name || 'Memuat petugas...'}</strong>
                <small>Petugas Lapangan</small>
              </div>
            </div>
          </div>
        </header>

        {mobileMenuOpen && (
          <nav className="admin-mobile-navigation">
            <Link to="/petugas/dashboard">Dashboard</Link>
            <a href="#daftar-tugas">Laporan Tugas</a>
            <button type="button" onClick={handleLogout}>
              Keluar
            </button>
          </nav>
        )}

        <div className="admin-content">
          <section className="admin-welcome">
            <div>
              <span className="admin-eyebrow">PANEL PETUGAS</span>
              <h1>Halo, {user?.name || 'Petugas'}! 👋</h1>
              <p>
                Pantau tugasmu dan tindak lanjuti laporan
                yang telah diberikan oleh admin.
              </p>
            </div>

            <button
              type="button"
              className="petugas-refresh-button"
              onClick={fetchDashboardData}
              disabled={isLoading}
            >
              <RefreshCw size={16} />
              Muat Ulang
            </button>
          </section>

          {errorMessage && (
            <div className="petugas-message petugas-error" role="alert">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="petugas-message petugas-success" role="status">
              {successMessage}
            </div>
          )}

          <section className="admin-stats">
            <StatCard
              title="Total Tugas"
              value={isLoading ? 0 : totalReports}
              description="Semua laporan ditugaskan"
              icon={<FileText size={21} />}
              color="admin-stat-green"
            />

            <StatCard
              title="Menunggu"
              value={isLoading ? 0 : waitingReports}
              description="Belum mulai ditangani"
              icon={<Clock3 size={21} />}
              color="admin-stat-orange"
            />

            <StatCard
              title="Diproses"
              value={isLoading ? 0 : processingReports}
              description="Sedang ditangani"
              icon={<TrendingUp size={21} />}
              color="admin-stat-blue"
            />

            <StatCard
              title="Selesai"
              value={isLoading ? 0 : completedReports}
              description="Tugas telah diselesaikan"
              icon={<CheckCircle2 size={21} />}
              color="admin-stat-purple"
            />
          </section>

          <section
            className="admin-panel admin-recent-panel"
            id="daftar-tugas"
          >
            <div className="admin-panel-heading">
              <div>
                <h2>Daftar Laporan Tugas</h2>
                <p>
                  Laporan yang ditugaskan kepada akun petugas ini.
                </p>
              </div>

              <span className="admin-view-all">
                {totalReports} tugas
              </span>
            </div>

            <div className="admin-report-list">
              {isLoading ? (
                <p>Memuat daftar tugas...</p>
              ) : sortedReports.length === 0 ? (
                <p>Belum ada laporan yang ditugaskan kepadamu.</p>
              ) : (
                sortedReports.map((report) => (
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
                        <span>{report.category_name || 'Kategori'}</span>
                        <span>
                          <MapPin size={13} />
                          {report.location}
                        </span>
                        <span>
                          <CalendarDays size={13} />
                          {formatDate(report.created_at)}
                        </span>
                      </div>

                      <p className="petugas-description">
                        {report.description}
                      </p>

                      <div className="petugas-actions">
                        {report.status === 'DITUGASKAN' && (
                          <button
                            type="button"
                            className="petugas-action-button petugas-start"
                            disabled={updatingId === report.id}
                            onClick={() =>
                              handleUpdateStatus(report.id, 'DITANGANI')
                            }
                          >
                            {updatingId === report.id
                              ? 'Memproses...'
                              : 'Mulai Penanganan'}
                          </button>
                        )}

                        {report.status === 'DITANGANI' && (
                          <button
                            type="button"
                            className="petugas-action-button petugas-finish"
                            disabled={updatingId === report.id}
                            onClick={() =>
                              handleUpdateStatus(report.id, 'SELESAI')
                            }
                          >
                            {updatingId === report.id
                              ? 'Memproses...'
                              : 'Tandai Selesai'}
                          </button>
                        )}

                        {report.status === 'SELESAI' && (
                          <span className="petugas-completed-label">
                            <CheckCircle2 size={15} />
                            Tugas selesai
                          </span>
                        )}
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
              <CheckCircle2 size={21} />
            </div>
            <div>
              <strong>Informasi penugasan</strong>
              <p>
                Data yang ditampilkan hanya laporan yang ditugaskan
                kepada akun petugas yang sedang login.
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

export default DashboardPetugas
