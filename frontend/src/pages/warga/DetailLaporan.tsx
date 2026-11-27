
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
  Wrench,
  XCircle,
} from 'lucide-react'
import {
  getReportById,
  type ReportData,
} from '../../services/report'
import './DetailLaporan.css'

const progressSteps = [
  {
    status: 'menunggu_verifikasi',
    title: 'Laporan diterima',
    description: 'Laporan berhasil dikirim dan menunggu pemeriksaan.',
    icon: <FileText size={18} />,
  },
  {
    status: 'diproses',
    title: 'Laporan sedang ditangani',
    description: 'Laporan sedang dalam proses penanganan.',
    icon: <Wrench size={18} />,
  },
  {
    status: 'selesai',
    title: 'Laporan selesai',
    description: 'Penanganan laporan telah dinyatakan selesai.',
    icon: <CheckCircle2 size={18} />,
  },
]

type ReportStatus =
  | 'menunggu_verifikasi'
  | 'diproses'
  | 'selesai'
  | 'ditolak'

// Mengubah status backend menjadi label tampilan.
function getStatusLabel(status: ReportStatus) {
  switch (status) {
    case 'menunggu_verifikasi':
      return 'BARU'
    case 'diproses':
      return 'DITANGANI'
    case 'selesai':
      return 'SELESAI'
    case 'ditolak':
      return 'DITOLAK'
  }
}

// Mengambil class CSS berdasarkan status.
function getStatusClass(status: ReportStatus) {
  switch (status) {
    case 'menunggu_verifikasi':
      return 'detail-status-new'
    case 'diproses':
      return 'detail-status-progress'
    case 'selesai':
      return 'detail-status-done'
    case 'ditolak':
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
  const isRejected = status === 'ditolak'

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
            </div>

            {report.assigned_to && (
              <div className="detail-information-item">
                <span>Petugas ditugaskan</span>
                <strong>
                  ID Petugas: {report.assigned_to}
                </strong>
              </div>
            )}
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
                  Laporan ini telah ditolak oleh pengelola.
                  Silakan hubungi pihak terkait untuk informasi lebih lanjut.
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
