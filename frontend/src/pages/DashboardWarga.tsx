
// Mengambil komponen navigasi dan ikon yang dibutuhkan dashboard.
import { Link } from 'react-router-dom'
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
  Menu,
  Leaf,
} from 'lucide-react'

// Mengambil stylesheet khusus dashboard warga.
import './DashboardWarga.css'

// Tipe data untuk setiap laporan yang ditampilkan.
interface Report {
  id: string
  title: string
  category: string
  location: string
  date: string
  status: 'Menunggu' | 'Diproses' | 'Selesai'
}

// Data sementara untuk mengisi tampilan dashboard.
const reports: Report[] = [
  {
    id: 'LAP-001',
    title: 'Sampah menumpuk di pinggir jalan',
    category: 'Kebersihan',
    location: 'Jl. Melati, RT 02',
    date: '24 November 2026',
    status: 'Menunggu',
  },
  {
    id: 'LAP-002',
    title: 'Jalan berlubang dekat balai warga',
    category: 'Infrastruktur',
    location: 'Jl. Mawar, RT 04',
    date: '22 November 2026',
    status: 'Diproses',
  },
  {
    id: 'LAP-003',
    title: 'Lampu penerangan jalan tidak menyala',
    category: 'Fasilitas Umum',
    location: 'Jl. Kenanga, RT 01',
    date: '19 November 2026',
    status: 'Selesai',
  },
]

// Mengubah status menjadi class CSS yang sesuai.
function getStatusClass(status: Report['status']) {
  switch (status) {
    case 'Menunggu':
      return 'status-waiting'
    case 'Diproses':
      return 'status-progress'
    case 'Selesai':
      return 'status-done'
    default:
      return ''
  }
}

// Komponen kartu statistik agar tampilan setiap ringkasan konsisten.
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
  return (
    <div className="dashboard-layout">
      {/* Sidebar untuk navigasi utama warga. */}
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
            <p>Laporkan masalah di sekitarmu dan bantu lingkungan menjadi lebih baik.</p>
            <Link to="/warga/laporan/buat">
              Buat laporan <ArrowUpRight size={15} />
            </Link>
          </div>

          {/* Tombol keluar sementara mengarah ke halaman login. */}
          <Link to="/login" className="dashboard-logout">
            <LogOut size={18} />
            <span>Keluar</span>
          </Link>
        </div>
      </aside>

      {/* Area konten utama dashboard. */}
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
              <div className="dashboard-avatar">JD</div>
              <div>
                <strong>Jay Doe</strong>
                <small>Warga</small>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Sapaan dan tombol untuk membuat laporan baru. */}
          <section className="dashboard-welcome">
            <div>
              <span className="dashboard-eyebrow">DASHBOARD WARGA</span>
              <h1>Halo, Jay! 👋</h1>
              <p>
                Pantau laporanmu dan ikut berkontribusi untuk lingkungan yang lebih baik.
              </p>
            </div>

            <Link to="/warga/laporan/buat" className="dashboard-create-button">
              <PlusCircle size={18} />
              Buat Laporan
            </Link>
          </section>

          {/* Ringkasan jumlah laporan berdasarkan status. */}
          <section className="dashboard-stats">
            <StatCard
              title="Total Laporan"
              value={12}
              description="Semua laporan kamu"
              icon={<FileText size={21} />}
              color="stat-green"
            />
            <StatCard
              title="Menunggu"
              value={4}
              description="Menunggu verifikasi"
              icon={<Clock3 size={21} />}
              color="stat-orange"
            />
            <StatCard
              title="Diproses"
              value={3}
              description="Sedang ditangani"
              icon={<Wrench size={21} />}
              color="stat-blue"
            />
            <StatCard
              title="Selesai"
              value={5}
              description="Berhasil diselesaikan"
              icon={<CheckCircle2 size={21} />}
              color="stat-purple"
            />
          </section>

          {/* Daftar laporan terbaru milik warga. */}
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
              {reports.map((report) => (
                <article className="dashboard-report-card" key={report.id}>
                  <div className="dashboard-report-symbol">
                    <FileText size={21} />
                  </div>

                  <div className="dashboard-report-info">
                    <div className="dashboard-report-meta">
                      <span>{report.id}</span>
                      <span className={`dashboard-status ${getStatusClass(report.status)}`}>
                        {report.status}
                      </span>
                    </div>

                    <h3>{report.title}</h3>

                    <div className="dashboard-report-details">
                      <span>{report.category}</span>
                      <span>
                        <MapPin size={13} />
                        {report.location}
                      </span>
                      <span>
                        <CalendarDays size={13} />
                        {report.date}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="dashboard-report-action"
                    aria-label={`Lihat detail ${report.title}`}
                    title="Detail laporan akan tersedia pada tahap berikutnya"
                  >
                    <ArrowUpRight size={19} />
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* Informasi tambahan untuk mengajak warga aktif melapor. */}
          <section className="dashboard-bottom-banner">
            <div className="dashboard-banner-icon">
              <Leaf size={28} />
            </div>
            <div>
              <h2>Perubahan dimulai dari kepedulianmu.</h2>
              <p>
                Menemukan masalah di lingkungan sekitar? Jangan ragu untuk melaporkannya.
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
