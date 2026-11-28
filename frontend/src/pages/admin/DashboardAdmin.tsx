
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
  Check,
  X,
  UserRound,
  RefreshCw,
} from 'lucide-react'
import { clearSession, getCurrentUser, type AuthUser } from '../../services/auth'
import {
  getReports,
  getCategories,
  getPetugas,
  updateReportStatus,
  assignReport,
  type ReportData,
  type Category,
  type Petugas,
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

// Mengubah status backend menjadi label yang mudah dibaca.
function getStatusLabel(status: string) {
  switch (status) {
    case 'BARU':
      return 'BARU'
    case 'DITOLAK':
      return 'DITOLAK'
    case 'TERVERIFIKASI':
      return 'TERVERIFIKASI'
    case 'DITUGASKAN':
      return 'DITUGASKAN'
    case 'DITANGANI':
      return 'DITANGANI'
    case 'SELESAI':
      return 'SELESAI'
    default:
      return status
  }
}

// Menentukan class CSS berdasarkan status laporan.
function getStatusClass(status: string) {
  switch (status) {
    case 'BARU':
    case 'DITOLAK':
      return 'admin-status-new'
    case 'TERVERIFIKASI':
      return 'admin-status-verified'
    case 'DITUGASKAN':
      return 'admin-status-assigned'
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

// Komponen kartu statistik dashboard.
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
  const [petugas, setPetugas] = useState<Petugas[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Menyimpan informasi proses dan pesan aksi admin.
  const [isSaving, setIsSaving] = useState(false)
  const [savingReportId, setSavingReportId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Menyimpan laporan yang sedang dibuka form penolakannya.
  const [rejectionTarget, setRejectionTarget] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Menyimpan pilihan petugas untuk setiap laporan.
  const [selectedPetugas, setSelectedPetugas] = useState<
    Record<string, string>
  >({})

  // Mengambil seluruh data dashboard dari backend.
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const [currentUser, reportData, categoryData, petugasData] =
        await Promise.all([
          getCurrentUser(),
          getReports(),
          getCategories(),
          getPetugas(),
        ])

      setUser(currentUser)
      setReports(reportData)
      setCategories(categoryData)
      setPetugas(petugasData)
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

  // Memuat data ketika halaman dashboard pertama kali dibuka.
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Menghitung statistik berdasarkan enam status resmi.
  const totalReports = reports.length

  const waitingReports = reports.filter(
    (report) => report.status === 'BARU'
  ).length

  const processingReports = reports.filter(
    (report) =>
      report.status === 'DITUGASKAN' ||
      report.status === 'DITANGANI'
  ).length

  const completedReports = reports.filter(
    (report) => report.status === 'SELESAI'
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

  // Menyiapkan data laporan selama enam bulan terakhir.
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

  // Mengurutkan lima laporan terbaru berdasarkan waktu pembuatan.
  const recentReports = useMemo(() => {
    return [...reports]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
      .slice(0, 5)
  }, [reports])

  // Mengambil semua laporan yang masih membutuhkan tindakan admin.
  const actionableReports = useMemo(() => {
    return [...reports]
      .filter(
        (report) =>
          report.status === 'BARU' ||
          report.status === 'TERVERIFIKASI'
      )
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      )
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

  // Mencari nama petugas berdasarkan ID penugasannya.
  const getPetugasName = (assignedTo: string | null) => {
    if (!assignedTo) {
      return 'Belum ditugaskan'
    }

    const officer = petugas.find(
      (item) => String(item.id) === String(assignedTo)
    )

    return officer?.name || `Petugas #${assignedTo}`
  }

  // Memverifikasi laporan yang masih berstatus BARU.
  const handleVerify = async (reportId: string) => {
    try {
      setIsSaving(true)
      setSavingReportId(reportId)
      setErrorMessage('')
      setSuccessMessage('')

      await updateReportStatus(reportId, 'TERVERIFIKASI')

      setSuccessMessage(`Laporan #${reportId} berhasil diverifikasi.`)
      setRejectionTarget(null)
      setRejectionReason('')

      await fetchDashboardData()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Gagal memverifikasi laporan.'
      )
    } finally {
      setIsSaving(false)
      setSavingReportId(null)
    }
  }

  // Menolak laporan dengan alasan minimal lima karakter.
  const handleReject = async (reportId: string) => {
    const reason = rejectionReason.trim()

    if (reason.length < 5) {
      setErrorMessage('Alasan penolakan minimal 5 karakter.')
      return
    }

    try {
      setIsSaving(true)
      setSavingReportId(reportId)
      setErrorMessage('')
      setSuccessMessage('')

      await updateReportStatus(reportId, 'DITOLAK', reason)

      setSuccessMessage(`Laporan #${reportId} berhasil ditolak.`)
      setRejectionTarget(null)
      setRejectionReason('')

      await fetchDashboardData()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Gagal menolak laporan.'
      )
    } finally {
      setIsSaving(false)
      setSavingReportId(null)
    }
  }

  // Menugaskan laporan terverifikasi kepada petugas yang dipilih.
  const handleAssign = async (reportId: string) => {
    const officerId = selectedPetugas[reportId]

    if (!officerId) {
      setErrorMessage('Pilih petugas terlebih dahulu.')
      return
    }

    try {
      setIsSaving(true)
      setSavingReportId(reportId)
      setErrorMessage('')
      setSuccessMessage('')

      await assignReport(reportId, Number(officerId))

      setSuccessMessage(`Laporan #${reportId} berhasil ditugaskan.`)

      setSelectedPetugas((previous) => ({
        ...previous,
        [reportId]: '',
      }))

      await fetchDashboardData()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Gagal menugaskan petugas.'
      )
    } finally {
      setIsSaving(false)
      setSavingReportId(null)
    }
  }

  // Membuka atau menutup form penolakan laporan.
  const toggleRejectionForm = (reportId: string) => {
    setErrorMessage('')
    setRejectionReason('')
    setRejectionTarget((current) =>
      current === reportId ? null : reportId
    )
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

          <a href="#antrean-admin" className="admin-nav-item">
            <FileText size={19} />
            <span>Verifikasi Laporan</span>
          </a>

          <a href="#laporan-terbaru" className="admin-nav-item">
            <ClipboardList size={19} />
            <span>Laporan Terbaru</span>
          </a>

          <a href="#ringkasan-kategori" className="admin-nav-item">
            <Users size={19} />
            <span>Ringkasan Kategori</span>
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
            <a href="#antrean-admin">Verifikasi Laporan</a>
            <a href="#laporan-terbaru">Laporan Terbaru</a>
            <a href="#ringkasan-kategori">Ringkasan Kategori</a>
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
            <div className="admin-feedback admin-feedback-error" role="alert">
              <AlertCircle size={17} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="admin-feedback admin-feedback-success" role="status">
              <CheckCircle2 size={17} />
              <span>{successMessage}</span>
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
              description="Ditugaskan dan diproses"
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

          {/* Antrean ini menampilkan semua laporan yang membutuhkan tindakan admin. */}
          <section
            className="admin-panel admin-action-panel"
            id="antrean-admin"
          >
            <div className="admin-panel-heading">
              <div>
                <h2>Antrean Tindakan Admin</h2>
                <p>
                  Verifikasi laporan baru atau tugaskan laporan yang sudah
                  terverifikasi.
                </p>
              </div>

              <button
                type="button"
                className="admin-refresh-button"
                onClick={fetchDashboardData}
                disabled={isLoading || isSaving}
              >
                <RefreshCw size={15} />
                <span>Perbarui</span>
              </button>
            </div>

            {isLoading ? (
              <p className="admin-empty-state">Memuat antrean laporan...</p>
            ) : actionableReports.length === 0 ? (
              <div className="admin-empty-state">
                <CheckCircle2 size={25} />
                <strong>Tidak ada antrean tindakan.</strong>
                <span>Semua laporan sudah diproses pada tahap admin.</span>
              </div>
            ) : (
              <div className="admin-action-list">
                {actionableReports.map((report) => {
                  const isReportSaving = savingReportId === report.id

                  return (
                    <article className="admin-action-card" key={report.id}>
                      <div className="admin-action-card-top">
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
                      </div>

                      {/* Admin hanya dapat memverifikasi atau menolak laporan BARU. */}
                      {report.status === 'BARU' && (
                        <div className="admin-action-controls">
                          {rejectionTarget === report.id ? (
                            <div className="admin-rejection-form">
                              <label htmlFor={`rejection-${report.id}`}>
                                Alasan penolakan
                              </label>

                              <textarea
                                id={`rejection-${report.id}`}
                                value={rejectionReason}
                                onChange={(event) =>
                                  setRejectionReason(event.target.value)
                                }
                                placeholder="Jelaskan alasan laporan ditolak..."
                                rows={3}
                                minLength={5}
                              />

                              <small>
                                Minimal 5 karakter. Alasan ini akan disimpan
                                pada data laporan.
                              </small>

                              <div className="admin-action-buttons">
                                <button
                                  type="button"
                                  className="admin-action-button admin-button-reject"
                                  onClick={() => handleReject(report.id)}
                                  disabled={isSaving}
                                >
                                  <X size={15} />
                                  {isReportSaving ? 'Memproses...' : 'Konfirmasi Tolak'}
                                </button>

                                <button
                                  type="button"
                                  className="admin-action-button admin-button-cancel"
                                  onClick={() => toggleRejectionForm(report.id)}
                                  disabled={isSaving}
                                >
                                  Batal
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="admin-action-buttons">
                              <button
                                type="button"
                                className="admin-action-button admin-button-verify"
                                onClick={() => handleVerify(report.id)}
                                disabled={isSaving}
                              >
                                <Check size={15} />
                                {isReportSaving ? 'Memproses...' : 'Verifikasi'}
                              </button>

                              <button
                                type="button"
                                className="admin-action-button admin-button-reject-outline"
                                onClick={() => toggleRejectionForm(report.id)}
                                disabled={isSaving}
                              >
                                <X size={15} />
                                Tolak
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Laporan terverifikasi dapat ditugaskan kepada petugas. */}
                      {report.status === 'TERVERIFIKASI' && (
                        <div className="admin-assignment-form">
                          <div className="admin-assignment-label">
                            <UserRound size={16} />
                            <span>Pilih petugas penanganan</span>
                          </div>

                          <div className="admin-assignment-controls">
                            <select
                              value={selectedPetugas[report.id] || ''}
                              onChange={(event) =>
                                setSelectedPetugas((previous) => ({
                                  ...previous,
                                  [report.id]: event.target.value,
                                }))
                              }
                              disabled={isSaving}
                            >
                              <option value="">Pilih petugas...</option>
                              {petugas.map((officer) => (
                                <option key={officer.id} value={officer.id}>
                                  {officer.name}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              className="admin-action-button admin-button-assign"
                              onClick={() => handleAssign(report.id)}
                              disabled={
                                isSaving ||
                                !selectedPetugas[report.id] ||
                                petugas.length === 0
                              }
                            >
                              <Check size={15} />
                              {isReportSaving ? 'Memproses...' : 'Tugaskan'}
                            </button>
                          </div>

                          {petugas.length === 0 && (
                            <small className="admin-assignment-hint">
                              Belum ada petugas yang tersedia.
                            </small>
                          )}
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          {/* Daftar ini tetap menampilkan lima laporan terbaru sebagai ringkasan. */}
          <section
            className="admin-panel admin-recent-panel"
            id="laporan-terbaru"
          >
            <div className="admin-panel-heading">
              <div>
                <h2>Laporan Terbaru</h2>
                <p>Daftar lima laporan yang paling baru diterima.</p>
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

                      {report.status === 'DITOLAK' && report.rejection_reason && (
                        <p className="admin-rejection-display">
                          Alasan penolakan: {report.rejection_reason}
                        </p>
                      )}

                      {report.assigned_to && (
                        <p className="admin-assigned-display">
                          <UserRound size={13} />
                          Petugas: {getPetugasName(report.assigned_to)}
                        </p>
                      )}
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
                Statistik, grafik, distribusi kategori, antrean tindakan,
                dan daftar laporan ditampilkan berdasarkan data yang
                tersimpan di database.
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
