
// Mengambil state untuk mengelola input dan visibilitas password.
import { useState, type ChangeEvent, type FormEvent } from 'react'

// Mengambil fungsi komunikasi autentikasi dari backend.
import { loginUser, registerUser, saveSession } from '../../services/auth'

// Mengambil Link untuk navigasi dan ikon untuk tampilan form.
import { Link, useNavigate } from 'react-router-dom'

import {
  Leaf,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react'

// Mengambil stylesheet khusus halaman autentikasi.
import './AuthPage.css'



// Menentukan mode halaman yang diperbolehkan.
interface AuthPageProps {
  mode: 'login' | 'register'
}

// Komponen autentikasi yang bisa menampilkan Login maupun Register.
function AuthPage({ mode }: AuthPageProps) {
  const isRegister = mode === 'register'
  const navigate = useNavigate()

  // Mengelola kondisi untuk menampilkan atau menyembunyikan password.
  const [showPassword, setShowPassword] = useState(false)

  // Menyimpan seluruh nilai input form.
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'warga',
  })

  // Menyimpan pesan validasi atau informasi form.
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('')
  // Menandai proses request agar tombol tidak dikirim berulang kali.
  const [isLoading, setIsLoading] = useState(false)

  // Memperbarui nilai input ketika pengguna mengetik.
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    // Menghapus pesan lama saat pengguna memperbaiki input.
    setMessage('')
    setMessageType('')
  }

  
  
// Memvalidasi input lalu mengirim data ke endpoint backend yang sesuai.
const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault()

  // Mengosongkan pesan sebelumnya dan mengaktifkan indikator loading.
  setMessage('')
  setMessageType('')
  setIsLoading(true)

  try {
    // Memastikan email memiliki format yang benar.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(form.email)) {
      throw new Error('Format email belum benar.')
    }

    // Memastikan password memenuhi batas minimal backend.
    if (form.password.length < 8) {
      throw new Error('Password minimal harus 8 karakter.')
    }

    if (isRegister) {
      // Memastikan nama dan konfirmasi password sudah benar.
      if (!form.name.trim()) {
        throw new Error('Nama lengkap wajib diisi.')
      }

      if (form.password !== form.confirmPassword) {
        throw new Error('Konfirmasi password tidak cocok.')
      }

      // Mengirim data registrasi ke POST /api/auth/register.
      const result = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })

      setMessage(result.message || 'Registrasi berhasil. Silakan login.')
      setMessageType('success')
      return
    }

    // Mengirim kredensial ke POST /api/auth/login.
    const result = await loginUser({
      email: form.email.trim(),
      password: form.password,
    })


    // Memeriksa respons login dari backend saat proses debugging.
    console.log('LOGIN RESPONSE:', result)
    console.log('USER ROLE:', result.data?.user?.role)

    // Memastikan backend mengembalikan token dan informasi pengguna.
    if (!result.data?.token || !result.data?.user) {
      throw new Error('Respons login dari server tidak lengkap.')
    }

    // Menyimpan sesi autentikasi setelah login berhasil.
    saveSession(result.data.token, result.data.user)

    // Menampilkan role dan memastikan fungsi navigasi terpanggil.
    console.log('ROLE:', JSON.stringify(result.data.user.role))
    console.log('NAVIGATE FUNCTION:', typeof navigate)

    if (result.data.user.role?.trim().toLowerCase() === 'warga') {
      console.log('Mengarahkan pengguna ke dashboard warga...')
      navigate('/warga/dashboard')
      return
    }

    setMessage(
      `Login berhasil. Dashboard ${result.data.user.role} belum tersedia.`,
    )
    setMessageType('success')

  } catch (error) {
    // Menampilkan pesan validasi atau error yang dikirim backend.
    setMessage(
      error instanceof Error
        ? error.message
        : 'Tidak dapat terhubung ke server.',
    )
    setMessageType('error')
  } finally {
    // Mengaktifkan kembali tombol setelah request selesai.
    setIsLoading(false)
  }
}


  return (
    <main className="auth-page">
      {/* Panel kiri berisi identitas dan informasi CivicMind. */}
      <section className="auth-visual">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-icon">
            <Leaf size={23} />
          </span>
          <span>CivicMind</span>
        </Link>

        <div className="auth-visual-content">
          <span className="auth-eyebrow">SMART COMMUNITY PLATFORM</span>

          <h1>
            Bersama membangun
            <br />
            lingkungan yang
            <br />
            <span>lebih baik.</span>
          </h1>

          <p>
            Suarakan masalah di lingkunganmu, pantau perkembangannya,
            dan ikut menciptakan perubahan bersama masyarakat.
          </p>

          <div className="auth-visual-note">
            <ShieldCheck size={21} />
            <span>Platform pelaporan masyarakat yang transparan.</span>
          </div>
        </div>

        {/* Ilustrasi dekoratif sederhana menggunakan CSS. */}
        <div className="auth-decoration" aria-hidden="true">
          <div className="auth-circle auth-circle-one" />
          <div className="auth-circle auth-circle-two" />
          <div className="auth-leaf-decoration">
            <Leaf size={120} />
          </div>
        </div>

        <span className="auth-visual-footer">
          CivicMind — Dari warga, untuk lingkungan.
        </span>
      </section>

      {/* Panel kanan berisi form login atau register. */}
      <section className="auth-content">
        <div className="auth-form-container">
          <Link to="/" className="auth-back-link">
            <ArrowLeft size={17} />
            Kembali ke beranda
          </Link>

          <div className="auth-heading">
            <span className="auth-section-label">
              {isRegister ? 'BUAT AKUN BARU' : 'SELAMAT DATANG KEMBALI'}
            </span>

            <h2>{isRegister ? 'Daftar akun' : 'Masuk ke CivicMind'}</h2>

            <p>
              {isRegister
                ? 'Bergabunglah dan mulai berkontribusi untuk lingkunganmu.'
                : 'Masuk untuk melihat laporan dan aktivitas lingkunganmu.'}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Nama hanya ditampilkan saat pengguna mendaftar. */}
            {isRegister && (
              <div className="auth-field">
                <label htmlFor="name">Nama lengkap</label>
                <div className="auth-input-wrapper">
                  <User size={18} />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="email">Alamat email</label>
              <div className="auth-input-wrapper">
                <Mail size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                  value={form.password}
                  onChange={handleChange}
                  required
                />

                {/* Tombol untuk mengubah visibilitas password. */}
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={
                    showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Konfirmasi password hanya diperlukan saat mendaftar. */}
            {isRegister && (
              <div className="auth-field">
                <label htmlFor="confirmPassword">Konfirmasi password</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {/* Role pendaftaran publik dibatasi untuk warga. */}
            {isRegister && (
              <div className="auth-field">
                <label htmlFor="role">Daftar sebagai</label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="auth-select"
                >
                  <option value="warga">Warga</option>
                </select>
                <span className="auth-field-hint">
                  Akun admin dan petugas dibuat oleh pengelola.
                </span>
              </div>
            )}

            {/* Menampilkan hasil validasi form. */}
            {message && (
              <div
                className={`auth-message auth-message-${messageType}`}
                role="alert"
              >
                {message}
              </div>
            )}

            {/* Tombol menampilkan status proses request ke backend. */}
            <button
              type="submit"
              className="auth-submit"
              disabled={isLoading}
            >
              {isLoading
                ? 'Memproses...'
                : isRegister
                  ? 'Buat Akun'
                  : 'Masuk'}
            </button>
          </form>

          <div className="auth-switch">
            {isRegister ? (
              <>
                Sudah punya akun? <Link to="/login">Masuk di sini</Link>
              </>
            ) : (
              <>
                Belum punya akun? <Link to="/register">Daftar sekarang</Link>
              </>
            )}
          </div>

          <div className="auth-security">
            <ShieldCheck size={16} />
            <span>Data akunmu akan digunakan untuk layanan CivicMind.</span>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AuthPage
