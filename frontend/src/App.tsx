
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import LandingPage from './pages/LandingPage'
import AuthPage from './pages/auth/AuthPage'
import DashboardWarga from './pages/DashboardWarga'
import BuatLaporan from './pages/warga/BuatLaporan'
import RiwayatLaporan from './pages/warga/RiwayatLaporan'
import DetailLaporan from './pages/warga/DetailLaporan'
import DashboardAdmin from './pages/admin/DashboardAdmin'
import DashboardPetugas from './pages/petugas/DashboardPetugas'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<AuthPage mode="login" />} />

        <Route path="/register" element={<AuthPage mode="register" />} />

        <Route
          path="/warga/dashboard"
          element={
            <ProtectedRoute allowedRoles={['warga']}>
              <DashboardWarga />
            </ProtectedRoute>
          }
        />

        <Route
          path="/warga/laporan/buat"
          element={
            <ProtectedRoute allowedRoles={['warga']}>
              <BuatLaporan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/warga/riwayat"
          element={
            <ProtectedRoute allowedRoles={['warga']}>
              <RiwayatLaporan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/warga/riwayat/:id"
          element={
            <ProtectedRoute allowedRoles={['warga']}>
              <DetailLaporan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/preview/admin"
          element={<DashboardAdmin />}
          />

        <Route
          path="/petugas/dashboard"
          element={
            <ProtectedRoute allowedRoles={['petugas']}>
              <DashboardPetugas />
            </ProtectedRoute>
          }/>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
