
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Leaf,
  MapPin,
  ShieldCheck,
  UserCheck,
  Wrench,
  XCircle,
  Image as ImageIcon,
} from 'lucide-react'
import {
  getReportById,
  type ReportData,
} from '../../services/report'
import './DetailLaporan.css'

type ReportStatus =
  | 'BARU'
  | 'TERVERIFIKASI'
  | 'DITUGASKAN'
  | 'DITANGANI'
  | 'SELESAI'
  | 'DITOLAK'

// Urutan tahapan mengikuti alur laporan pada backend.
const progressSteps = [
  {
    status: 'BARU',
    title: 'Laporan diterima',
    description: 'Laporan berhasil dikirim dan menunggu pemeriksaan admin.',
    icon: <FileText size={18} />,
  },
  {
    status: 'TERVERIFIKASI',
    title: 'Laporan terverifikasi',
    description: 'Laporan telah diperiksa dan dinyatakan valid oleh admin.',
    icon: <ShieldCheck size={18} />,
  },
  {
    status: 'DITUGASKAN',
    title: 'Petugas ditugaskan',
    description: 'Laporan telah diberikan kepada petugas untuk ditangani.',
    icon: <UserCheck size={18} />,
  },
  {
    status: 'DITANGANI',
    title: 'Laporan sedang ditangani',
    description: 'Petugas sedang melakukan penanganan laporan.',
    icon: <Wrench size={18} />,
  },
  {
    status: 'SELESAI',
    title: 'Laporan selesai',
    description: 'Penanganan laporan telah dinyatakan selesai.',
    icon: <CheckCircle2 size={18} />,
  },
]

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
function getStatusClass(status: ReportStatus): string {
  switch (status) {
    case 'BARU':
      return 'detail-status-new'
    case 'TERVERIFIKASI':
      return 'detail-status-verified'
    case 'DITUGASKAN':
      return 'detail-status-assigned'
    case 'DITANGANI':
      return 'detail-status-progress'
    case 'SELESAI':
      return 'detail-status-done'
    case 'DITOLAK':
      return 'detail-status-rejected'
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

function DetailLaporan() {
  const { id } = useParams<{ id: string }>()

  const [report, setReport] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [photoError, setPhotoError] = useState(false)

  // Mengambil detail laporan dari backend.
  useEffect(() => {
    let isMounted = true

    const fetchReport = async () => {
      if (!id || !/^\d+$/.test(id) || Number(id) <= 0) {
        setMessage('ID laporan tidak valid.')
        setIsLoading(false)
        return
      }

      try {
        const data = await getReportById(id)

        if (isMounted) {
          setReport(data)
          setPhotoError(false)
        }
      } catch (error) {
        if (isMounted) {
          setMessage(
            error instanceof Error
              ? error.message
              : 'Gagal mengambil detail laporan.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchReport()

    return () => {
      isMounted = false
    }
  }, [id])

  if (isLoading) {
    return (
      <main className="detail-page">
        <div className="detail-not-found">
          <Clock3 size={30} />
          <h1>Memuat detail laporan...</h1>
          <p>Mohon tunggu sebentar.</p>
        </div>
      </main>
    )
  }

  if (!report) {
    return (
      <main className="detail-page">
        <div className="detail-not-found">
          <div className="detail-not-found-icon">
            <FileText size={30} />
          </div>
          <h1>Laporan tidak ditemukan</h1>
          <p>{message || 'Data laporan tidak tersedia.'}</p>
          <Link to="/warga/riwayat" className="detail-back-button">
            <ArrowLeft size={17} />
            Kembali ke Riwayat
          </Link>
        </div>
      </main>
    )
  }

  const status = report.status as ReportStatus
  const isRejected = status === 'DITOLAK'

  // Menentukan posisi laporan pada timeline.
  const currentStep = progressSteps.findIndex(
    (step) => step.status === status,
  )

  return (
    <main className="detail-page">
      <div className="detail-container">
        <header className="detail-header">
          <Link to="/warga/dashboard" className="detail-brand">
            <span className="detail-brand-icon">
              <Leaf size={22} />
            </span>
            <strong>CivicMind</strong>
          </Link>

          <Link to="/warga/riwayat" className="detail-back">
            <ArrowLeft size={17} />
            Riwayat Laporan
          </Link>
        </header>

        <section className="detail-heading">
          <span className="detail-eyebrow">INFORMASI LAPORAN</span>
          <h1>Detail Laporan</h1>
          <p>Pantau informasi dan perkembangan laporanmu.</p>
        </section>

        <div className="detail-content">
          <section className="detail-report-card">
            <div className="detail-report-top">
              <span className="detail-report-id">
                #{report.id}
              </span>
              <span className={`detail-status ${getStatusClass(status)}`}>
                {getStatusLabel(status)}
              </span>
            </div>

            <h2>{report.title}</h2>

            {/* Menampilkan foto bukti laporan dari signed URL Supabase. */}
            <div style={{ marginBottom: 22 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  marginBottom: 10,
                  color: '#718078',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                <ImageIcon size={16} />
                Foto Bukti Laporan
              </div>

              {report.photo_url && !photoError ? (
                <img
                  src={report.photo_url}
                  alt={`Foto bukti laporan ${report.title}`}
                  onError={() => setPhotoError(true)}
                  style={{
                    display: 'block',
                    width: '100%',
                    maxHeight: 360,
                    objectFit: 'cover',
                    borderRadius: 11,
                    border: '1px solid #e7eee9',
                  }}
                />
              ) : (
                <div
                  style={{
                    minHeight: 110,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    border: '1px dashed #d5e3d9',
                    borderRadius: 11,
                    background: '#f7faf7',
                    color: '#84938a',
                    fontSize: 11,
                    textAlign: 'center',
                  }}
                >
                  <ImageIcon size={24} />
                  {photoError
                    ? 'Foto gagal dimuat. Silakan muat ulang halaman.'
                    : 'Foto bukti tidak tersedia.'}
                </div>
              )}
            </div>

            <div className="detail-information-grid">
              <div className="detail-information-item">
                <span>Kategori</span>
                <strong>
                  {report.category_name || 'Tidak tersedia'}
                </strong>
              </div>

              <div className="detail-information-item">
                <span>Tanggal laporan</span>
                <strong>
                  <CalendarDays size={15} />
                  {formatDate(report.created_at)}
                </strong>
              </div>

              <div className="detail-information-item detail-location">
                <span>Lokasi kejadian</span>
                <strong>
                  <MapPin size={15} />
                  {report.location}
                </strong>
              </div>

              <div className="detail-information-item">
                <span>Deskripsi</span>
                <strong>{report.description}</strong>
              </div>

              {report.verified_at && (
                <div className="detail-information-item">
                  <span>Tanggal verifikasi</span>
                  <strong>
                    <ShieldCheck size={15} />
                    {formatDate(report.verified_at)}
                  </strong>
                </div>
              )}

              {report.assigned_to && (
                <div className="detail-information-item">
                  <span>Petugas ditugaskan</span>
                  <strong>
                    <UserCheck size={15} />
                    ID Petugas: {report.assigned_to}
                  </strong>
                </div>
              )}
            </div>
          </section>

          {isRejected ? (
            <section className="detail-rejected-card">
              <div className="detail-rejected-icon">
                <XCircle size={24} />
              </div>
              <div>
                <span>STATUS LAPORAN</span>
                <h2>Laporan ditolak</h2>
                <p>
                  {report.rejection_reason ||
                    'Laporan ini telah ditolak oleh pengelola.'}
                </p>
              </div>
            </section>
          ) : (
            <section className="detail-timeline-card">
              <div className="detail-section-heading">
                <div>
                  <h2>Timeline Laporan</h2>
                  <p>
                    Tahapan laporan berdasarkan status terkini.
                  </p>
                </div>
                <span className="detail-timeline-count">
                  {currentStep >= 0 ? currentStep + 1 : 1} / {progressSteps.length}
                </span>
              </div>

              <div className="detail-timeline">
                {progressSteps.map((step, index) => {
                  const isCompleted =
                    currentStep >= 0 && index < currentStep

                  const isCurrent = index === currentStep

                  return (
                    <div
                      className={`detail-timeline-item ${
                        isCompleted ? 'completed' : ''
                      } ${isCurrent ? 'current' : ''}`}
                      key={step.status}
                    >
                      <div className="detail-timeline-marker">
                        {isCompleted ? (
                          <CheckCircle2 size={19} />
                        ) : (
                          step.icon
                        )}
                      </div>

                      <div className="detail-timeline-content">
                        <div className="detail-timeline-title">
                          <h3>{step.title}</h3>
                          {isCurrent && (
                            <span className="detail-current-label">
                              Status sekarang
                            </span>
                          )}
                        </div>

                        <p>{step.description}</p>

                        {index === 0 && (
                          <small>
                            Dilaporkan pada {formatDate(report.created_at)}
                          </small>
                        )}

                        {!isCompleted && !isCurrent && (
                          <small>Menunggu tahapan sebelumnya</small>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>

        <footer className="detail-footer">
          <Leaf size={16} />
          <span>Bersama membangun lingkungan yang lebih baik.</span>
        </footer>
      </div>
    </main>
  )
}

export default DetailLaporan
