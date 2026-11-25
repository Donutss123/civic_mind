
// Mengambil komponen routing dari React Router.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Mengambil halaman landing page yang sudah kita pindahkan.
import LandingPage from './pages/LandingPage'

// Mengambil halaman autentikasi untuk login dan register.
import AuthPage from './pages/auth/AuthPage'

// Mengambil halaman dashboard khusus warga.
import DashboardWarga from './pages/DashboardWarga'

// Komponen utama yang mengatur perpindahan antarhalaman CivicMind.
function App() {
  return (
    // BrowserRouter mengaktifkan sistem navigasi berdasarkan URL.
    <BrowserRouter>
      <Routes>
        {/* Halaman utama CivicMind. */}
        <Route path="/" element={<LandingPage />} />

        {/* Halaman login menggunakan mode login. */}
        <Route path="/login" element={<AuthPage mode="login" />} />

        {/* Halaman registrasi menggunakan mode register. */}
        <Route path="/register" element={<AuthPage mode="register" />} />

        {/* URL yang tidak dikenal akan diarahkan kembali ke halaman utama. */}
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route
        path="/warga/dashboard"
        element={<DashboardWarga />}
        />
      </Routes>

      
    </BrowserRouter>
  )
}

// Mengekspor App agar bisa digunakan oleh main.tsx.
export default App
