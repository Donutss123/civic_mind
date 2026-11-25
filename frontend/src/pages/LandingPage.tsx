
import { useState } from 'react'
import {
  ArrowRight,
  Menu,
  X,
  Leaf,
  ShieldCheck,
  Clock3,
  Users,
  MapPin,
  FileText,
  CheckCircle2,
  ClipboardList,
  HeartHandshake,
  Smartphone,
  Eye,
  Send,
  ChevronRight,
} from 'lucide-react'
// Mengambil stylesheet landing page dari folder src.
import '../App.css'

// Mengambil komponen Link untuk navigasi antarhalaman.
import { Link } from 'react-router-dom'

const features = [
  {
    icon: Smartphone,
    title: 'Mudah Digunakan',
    description: 'Laporkan permasalahan lingkungan langsung dari ponsel dengan proses yang sederhana.',
  },
  {
    icon: Eye,
    title: 'Transparan',
    description: 'Pantau perkembangan laporan dan ketahui setiap tahapan penanganannya.',
  },
  {
    icon: Clock3,
    title: 'Responsif',
    description: 'Laporan dikelola secara terstruktur agar dapat segera ditindaklanjuti.',
  },
  {
    icon: HeartHandshake,
    title: 'Untuk Semua',
    description: 'Menghubungkan warga, admin, dan petugas dalam satu ekosistem komunitas.',
  },
]

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Buat Laporan',
    description: 'Warga mengirim laporan disertai deskripsi, kategori, foto, dan lokasi.',
  },
  {
    number: '02',
    icon: ClipboardList,
    title: 'Verifikasi Admin',
    description: 'Admin memeriksa laporan dan menugaskan petugas yang sesuai.',
  },
  {
    number: '03',
    icon: CheckCircle2,
    title: 'Penanganan',
    description: 'Petugas menangani masalah dan memperbarui progres hingga selesai.',
  },
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="website">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="container nav-container">
          <a href="#beranda" className="brand" onClick={closeMenu}>
            <div className="brand-icon">
              <Leaf size={25} strokeWidth={2.5} />
            </div>
            <div className="brand-text">
              <strong>CivicMind</strong>
              <span>Smart Community Platform</span>
            </div>
          </a>

          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Buka navigasi"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>

          <nav className={`nav-links ${menuOpen ? 'active' : ''}`}>
            <a href="#beranda" onClick={closeMenu}>Beranda</a>
            <a href="#tentang" onClick={closeMenu}>Tentang</a>
            <a href="#layanan" onClick={closeMenu}>Layanan</a>
            <a href="#panduan" onClick={closeMenu}>Panduan</a>
            <a href="#kontak" onClick={closeMenu}>Kontak</a>
            <div className="nav-actions">
              <Link to="/login" className="btn-login" onClick={closeMenu}>Login</Link>
              <Link to="/register" className="btn-primary btn-small" onClick={closeMenu}>
                Daftar <ArrowRight size={15} />
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero" id="beranda">
          <div className="hero-decoration hero-decoration-one" />
          <div className="hero-decoration hero-decoration-two" />

          <div className="container hero-container">
            <div className="hero-content">
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                BERSAMA MEMBANGUN LINGKUNGAN
              </div>

              <h1>
                Suara Warga,
                <span> Perubahan Nyata.</span>
              </h1>

              <p className="hero-description">
                Laporkan permasalahan lingkungan dan fasilitas umum
                dengan mudah. Pantau proses penanganannya secara
                transparan bersama CivicMind.
              </p>

              <div className="hero-actions">
                <a href="#daftar" className="btn-primary">
                  <Send size={17} />
                  Buat Laporan
                </a>
                <a href="#panduan" className="btn-outline">
                  Lihat Panduan
                  <ArrowRight size={17} />
                </a>
              </div>

              <div className="hero-trust">
                <div className="trust-icon">
                  <ShieldCheck size={19} />
                </div>
                <span>Pelaporan transparan untuk komunitas yang lebih baik</span>
              </div>
            </div>

            {/* HERO VISUAL */}
            <div className="hero-visual">
              <div className="visual-glow" />

              <div className="visual-heading">
                <div>
                  <span className="visual-label">CIVICMIND OVERVIEW</span>
                  <h3>Lingkungan Lebih Baik</h3>
                </div>
                <div className="live-indicator">
                  <span /> Live
                </div>
              </div>

              <div className="illustration">
                <div className="sun" />
                <div className="hill hill-back" />
                <div className="hill hill-front" />

                <div className="tree tree-one">
                  <span />
                </div>
                <div className="tree tree-two">
                  <span />
                </div>
                <div className="house">
                  <div className="roof" />
                  <div className="house-body">
                    <span className="window" />
                    <span className="door" />
                  </div>
                </div>

                <div className="illustration-caption">
                  <Leaf size={18} />
                  <span>Mulai dari kepedulian kita</span>
                </div>
              </div>

              <div className="floating-report">
                <div className="report-icon">
                  <MapPin size={19} />
                </div>
                <div className="report-text">
                  <strong>Laporan Lingkungan</strong>
                  <span>Menunggu penanganan</span>
                </div>
                <span className="report-dot" />
              </div>

              <div className="floating-success">
                <CheckCircle2 size={19} />
                <div>
                  <strong>Perubahan dimulai</strong>
                  <span>Melalui partisipasi warga</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="statistics" id="layanan">
          <div className="container stats-container">
            <div className="stat-card">
              <div className="stat-icon">
                <FileText size={23} />
              </div>
              <div>
                <h3>Terintegrasi</h3>
                <p>Satu platform pelaporan</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Users size={23} />
              </div>
              <div>
                <h3>Kolaboratif</h3>
                <p>Warga dan pengelola</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Clock3 size={23} />
              </div>
              <div>
                <h3>Terpantau</h3>
                <p>Progres setiap laporan</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <ShieldCheck size={23} />
              </div>
              <div>
                <h3>Transparan</h3>
                <p>Riwayat penanganan jelas</p>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="section about-section" id="tentang">
          <div className="container">
            <div className="section-heading">
              <span className="section-label">TENTANG CIVICMIND</span>
              <h2>
                Kepedulian Kecil,
                <span> Dampak yang Besar.</span>
              </h2>
              <p>
                CivicMind hadir untuk menghubungkan kepedulian masyarakat
                dengan penanganan masalah lingkungan yang lebih terstruktur,
                mudah dipantau, dan transparan.
              </p>
            </div>

            <div className="features-grid">
              {features.map((feature, index) => {
                const Icon = feature.icon

                return (
                  <article className="feature-card" key={feature.title}>
                    <div className="feature-icon">
                      <Icon size={25} />
                    </div>
                    <span className="feature-number">0{index + 1}</span>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section process-section" id="panduan">
          <div className="container">
            <div className="section-heading">
              <span className="section-label">CARA KERJA</span>
              <h2>
                Mudah Melapor,
                <span> Jelas Penanganannya.</span>
              </h2>
              <p>
                Tiga langkah sederhana untuk menciptakan lingkungan
                yang lebih baik bersama CivicMind.
              </p>
            </div>

            <div className="steps-grid">
              {steps.map((step) => {
                const Icon = step.icon

                return (
                  <article className="step-card" key={step.number}>
                    <div className="step-top">
                      <span>{step.number}</span>
                      <div className="step-icon">
                        <Icon size={26} />
                      </div>
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                    <ChevronRight className="step-arrow" size={21} />
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section" id="daftar">
          <div className="container">
            <div className="cta-card">
              <div className="cta-decoration" />
              <div className="cta-content">
                <span className="section-label">MARI BERKOLABORASI</span>
                <h2>
                  Lingkungan yang Lebih Baik
                  Dimulai dari Kita.
                </h2>
                <p>
                  Jadilah bagian dari perubahan. Sampaikan kepedulianmu
                  dan bantu ciptakan komunitas yang lebih baik.
                </p>
                <a href="#masuk" className="btn-cta">
                  Mulai Sekarang
                  <ArrowRight size={18} />
                </a>
              </div>
              <div className="cta-icon">
                <Leaf size={100} strokeWidth={1.2} />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer" id="kontak">
        <div className="container footer-content">
          <div className="footer-brand">
            <a href="#beranda" className="brand">
              <div className="brand-icon">
                <Leaf size={25} />
              </div>
              <div className="brand-text">
                <strong>CivicMind</strong>
                <span>Smart Community Platform</span>
              </div>
            </a>
            <p>
              Menghubungkan kepedulian warga dengan tindakan nyata
              untuk lingkungan yang lebih baik.
            </p>
          </div>

          <div className="footer-links">
            <h4>Navigasi</h4>
            <a href="#beranda">Beranda</a>
            <a href="#tentang">Tentang Kami</a>
            <a href="#layanan">Layanan</a>
            <a href="#panduan">Panduan</a>
          </div>

          <div className="footer-links">
            <h4>Platform</h4>
            <a href="#masuk">Login</a>
            <a href="#daftar">Daftar</a>
            <a href="#panduan">Cara Kerja</a>
          </div>
        </div>

        <div className="container footer-bottom">
          <span>© 2026 CivicMind. All rights reserved.</span>
          <span>Built for a better community <Leaf size={14} /></span>
        </div>
      </footer>
    </div>
  )
}

export default App
