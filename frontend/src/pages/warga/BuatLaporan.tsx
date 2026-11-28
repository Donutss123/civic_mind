
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ImagePlus,
  MapPin,
  Send,
  X,
  Leaf,
  House,
  PlusCircle,
  ClipboardList,
  Map,
  UserRound,
} from 'lucide-react'
import { createReport, getCategories, type Category } from '../../services/report.ts'
import './BuatLaporan.css'

function BuatLaporan() {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: '',
    category: '',
    location: '',
    description: '',
  })

  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [message, setMessage] = useState('')

  // Mengambil kategori aktif dari backend.
  useEffect(() => {
    let isMounted = true

    const fetchCategories = async () => {
      try {
        const data = await getCategories()

        if (isMounted) {
          setCategories(data)
        }
      } catch (error) {
        if (isMounted) {
          setMessage(
            error instanceof Error
              ? error.message
              : 'Gagal mengambil data kategori.',
          )
        }
      } finally {
        if (isMounted) {
          setCategoriesLoading(false)
        }
      }
    }

    fetchCategories()

    return () => {
      isMounted = false
    }
  }, [])

  // Membersihkan URL preview foto ketika preview berubah atau halaman ditinggalkan.
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  // Memperbarui nilai input form.
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    setMessage('')
  }

  // Memilih kategori berdasarkan ID dari database.
  const handleCategoryChange = (categoryId: string) => {
    setForm((previous) => ({
      ...previous,
      category: categoryId,
    }))

    setMessage('')
  }

  // Memeriksa dan menampilkan foto yang dipilih.
  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setMessage('Format foto harus JPG atau PNG.')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Ukuran foto maksimal 5 MB.')
      event.target.value = ''
      return
    }

    setMessage('')
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  // Menghapus foto yang sudah dipilih.
  const removePhoto = () => {
    setPhoto(null)
    setPreview('')
  }

  // Memvalidasi dan mengirim laporan beserta foto ke backend.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      !form.title.trim() ||
      !form.category ||
      !form.location.trim() ||
      !form.description.trim()
    ) {
      setMessage('Semua kolom wajib diisi.')
      return
    }

    if (!photo) {
      setMessage('Foto bukti laporan wajib diunggah.')
      return
    }

    if (form.title.trim().length < 3) {
      setMessage('Judul laporan minimal 3 karakter.')
      return
    }

    if (form.description.trim().length < 10) {
      setMessage('Deskripsi laporan minimal 10 karakter.')
      return
    }

    if (form.location.trim().length < 3) {
      setMessage('Lokasi minimal 3 karakter.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const result = await createReport({
        category_id: Number(form.category),
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        photo,
      })

      setMessage(
        `${result.message}. ID laporan: ${result.data.id}`,
      )

      // Mengosongkan form setelah laporan berhasil dibuat.
      setForm({
        title: '',
        category: '',
        location: '',
        description: '',
      })

      setPhoto(null)
      setPreview('')
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Gagal mengirim laporan. Silakan coba lagi.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="create-report-page">
      <div className="create-report-app">
        <header className="create-report-header">
          <Link to="/warga/dashboard" className="create-report-brand">
            <Leaf size={22} />
            <strong>CivicMind</strong>
          </Link>

          <Link to="/warga/dashboard" className="create-report-back">
            <ArrowLeft size={17} />
            Kembali
          </Link>
        </header>

        <section className="create-report-banner">
          <div>
            <span>LAYANAN WARGA</span>
            <h1>Buat Laporan</h1>
            <p>Sampaikan masalah di sekitarmu dengan mudah.</p>
          </div>
          <div className="create-report-banner-icon">
            <Send size={25} />
          </div>
        </section>

        <form className="create-report-form" onSubmit={handleSubmit}>
          <div className="report-field">
            <label htmlFor="title">Judul laporan</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Contoh: Tumpukan sampah di saluran air"
              maxLength={150}
              required
            />
          </div>

          <div className="report-field">
            <label htmlFor="description">Deskripsi</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Jelaskan masalah yang kamu temukan..."
              rows={3}
              required
            />
          </div>

          <div className="report-field">
            <label>Kategori</label>

            {categoriesLoading ? (
              <span>Memuat kategori...</span>
            ) : categories.length > 0 ? (
              <div className="report-category-list">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`report-category-chip ${
                      form.category === category.id ? 'active' : ''
                    }`}
                    aria-pressed={form.category === category.id}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            ) : (
              <span>Kategori tidak tersedia. Silakan coba lagi.</span>
            )}
          </div>

          <div className="report-field">
            <label>Foto bukti</label>
            <label className="report-upload-area" htmlFor="photo">
              <ImagePlus size={25} />
              <strong>{photo ? 'Ganti foto' : 'Tambah foto laporan'}</strong>
              <span>JPG atau PNG, maksimal 5 MB</span>
              <input
                id="photo"
                type="file"
                accept="image/png,image/jpeg"
                onChange={handlePhotoChange}
                hidden
              />
            </label>

            <span className="report-location-note">
              Foto bukti wajib disertakan dan akan disimpan dengan aman.
            </span>

            {preview && (
              <div className="report-photo-preview">
                <img src={preview} alt="Pratinjau foto laporan" />
                <span>{photo?.name}</span>
                <button
                  type="button"
                  onClick={removePhoto}
                  aria-label="Hapus foto"
                >
                  <X size={17} />
                </button>
              </div>
            )}
          </div>

          <div className="report-field">
            <label htmlFor="location">Lokasi</label>
            <div className="report-input-icon">
              <MapPin size={18} />
              <input
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Masukkan lokasi kejadian"
                required
              />
            </div>
            <span className="report-location-note">
              Pastikan lokasi laporan sudah sesuai.
            </span>
          </div>

          {message && (
            <div className="report-form-message" role="alert">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="report-submit-button"
            disabled={
              isSubmitting ||
              categoriesLoading ||
              categories.length === 0
            }
          >
            <Send size={17} />
            {isSubmitting ? 'Mengirim Laporan...' : 'Kirim Laporan'}
          </button>
        </form>

        <nav className="report-bottom-nav" aria-label="Navigasi warga">
          <Link to="/warga/dashboard">
            <House size={19} />
            <span>Beranda</span>
          </Link>

          <Link to="/warga/laporan/buat" className="active" aria-current="page">
            <PlusCircle size={19} />
            <span>Lapor</span>
          </Link>

          <span className="coming-soon">
            <ClipboardList size={19} />
            <span>Lacak</span>
          </span>

          <span className="coming-soon">
            <Map size={19} />
            <span>Peta</span>
          </span>

          <span className="coming-soon">
            <UserRound size={19} />
            <span>Akun</span>
          </span>
        </nav>
      </div>
    </main>
  )
}

export default BuatLaporan
