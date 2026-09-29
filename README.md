# BloodCare — Audit Proyek

![](.attachments.77533/icon-512.png)

> Dokumen ini adalah hasil audit kode sumber proyek **BloodCare** (per 28 September 2026).
> Isinya: fungsi website, arsitektur sistem, spesifikasi teknis, bahasa pemrograman yang dipakai, serta temuan audit.

---

## 1. Apa fungsi website ini?

**BloodCare** ("Guard Your Heart Health") adalah aplikasi web **pemantau tekanan darah untuk keluarga**. Aplikasi ini bisa dipasang di HP sebagai PWA (Progressive Web App).

Yang bisa dilakukan pengguna:

| Fitur                         | Keterangan                                                                                                                                                                     |
|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Cek tekanan darah**         | Masukkan sistolik, diastolik, dan (opsional) denyut nadi. Aplikasi langsung menampilkan kategori hasilnya.                                                                     |
| **Klasifikasi AHA/ACC**       | Hasil dikelompokkan jadi 5 kategori: *Normal*, *Elevated*, *Hipertensi Tahap 1*, *Hipertensi Tahap 2*, dan *Krisis Hipertensi*. Setiap kategori punya emoji dan warna sendiri. |
| **Analisis denyut nadi**      | Rentang normal nadi disesuaikan dengan umur pemilik akun (bayi sampai dewasa), lalu diberi status *low / normal / high*.                                                       |
| **Rekomendasi & peringatan**  | Daftar saran gaya hidup (3–8 butir) dan risiko kesehatan yang muncul sesuai kategori.                                                                                          |
| **Profil anggota keluarga**   | Buat, ubah, dan hapus "akun" (nama + tanggal lahir). Akun **tidak memakai login/password**, hanya dipakai untuk mengelompokkan riwayat.                                        |
| **Riwayat & tren**            | Setiap akun punya riwayat pengukuran, grafik garis (gabungan, sistolik, diastolik), dan analisis tren (*membaik / stabil / memburuk*).                                         |
| **Mode tanpa akun**           | Pengukuran tanpa memilih akun tetap dianalisis, tetapi **tidak disimpan**.                                                                                                     |
| **Proteksi hapus akun**       | Menghapus akun (beserta seluruh riwayatnya) harus memasukkan password hapus dari konfigurasi server.                                                                           |
| **Dua bahasa**                | Inggris (default) dan Indonesia, bisa diganti langsung dari menu.                                                                                                              |
| **Tema gelap / terang**       | Tema gelap sebagai default, pilihan disimpan di browser.                                                                                                                       |
| **Offline / bisa di-install** | Service worker menyimpan tampilan aplikasi di cache, sehingga UI tetap terbuka tanpa internet (fitur yang butuh API tetap perlu koneksi).                                      |

> ⚠️ Aplikasi ini menampilkan disclaimer bahwa informasinya **bersifat edukasi dan bukan pengganti nasihat medis**.

---

## 2. Arsitektur sistem

Aplikasi ini terdiri dari **2 container Docker** yang diatur lewat `docker-compose.yml`:

```
                 Internet / Cloudflare Tunnel
                            │
                 (network eksternal: cloudflare)
                            │   host port 8082
                            ▼
┌──────────────────────────────────────────────┐
│  Container: bloodcare   (nginx:1.27-alpine)  │
│  - Menyajikan file statis frontend/          │
│  - Reverse proxy /api/*  ─────────────┐      │
└───────────────────────────────────────┼──────┘
                                        │ network: bloodcare-internal
                                        ▼
┌──────────────────────────────────────────────┐
│  Container: bloodcare-api (python:3.12-alpine)│
│  - Gunicorn (2 worker) :3000                 │
│  - Flask + Flask-SQLAlchemy                  │
│  - SQLite  →  /data/bloodcare.db             │
└───────────────────────┬──────────────────────┘
                        │ bind mount
                        ▼
              ./bloodcare-data/bloodcare.db  (di host)
```

### Alur request

1. Browser membuka `index.html`. Nginx menyajikan HTML, CSS, JS, Bootstrap, dan ikon.
2. JavaScript (ES Modules) memanggil `fetch('/api/...')`.
3. Nginx meneruskan `/api/` ke `bloodcare-api:3000`.
4. Flask memvalidasi input, mengklasifikasi hasil, menyimpan ke SQLite (hanya jika ada akun), lalu mengembalikan JSON.
5. Frontend menerjemahkan ID rekomendasi/peringatan (`rec_*`, `warn_*`, `category.*`) ke bahasa yang sedang aktif. **Backend tidak berurusan dengan bahasa.**

### Struktur folder

```
bloodcare/
├── docker-compose.yml        # Orkestrasi 2 service + network + volume
├── Dockerfile                # Image nginx + frontend
├── nginx.conf                # Static server, proxy /api, gzip, cache header
├── PROJECT_STATUS.md         # Catatan status pengembangan
├── bloodcare-data/
│   └── bloodcare.db          # Database SQLite (data nyata, bind mount)
├── backend/                  # REST API (Python/Flask)
│   ├── app.py                # Application factory, error handler, /api/health
│   ├── wsgi.py               # Entry point Gunicorn
│   ├── config.py             # DATA_DIR, DELETE_PASSWORD, URI SQLite
│   ├── extensions.py         # Instance SQLAlchemy
│   ├── models.py             # Model Account & BloodPressureRecord
│   ├── routes/
│   │   ├── accounts.py       # CRUD akun
│   │   └── readings.py       # Cek tekanan darah & riwayat
│   ├── services/
│   │   └── classification.py # Logika AHA/ACC, nadi, rekomendasi, tren
│   ├── utils/
│   │   └── validators.py     # Validasi input
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
└── frontend/                 # SPA vanilla JS (tanpa build step)
    ├── index.html            # Satu halaman: Dashboard / Result / History + modal
    ├── css/style.css         # Token tema gelap/terang, warna kategori
    ├── js/
    │   ├── app.js            # Bootstrap aplikasi, navigasi, registrasi SW
    │   ├── api.js            # Wrapper fetch ke /api
    │   ├── accounts.js       # Modal buat/ubah/hapus akun, toast
    │   ├── dashboard.js      # Form cek & tampilan hasil
    │   ├── history.js        # Riwayat, kartu, grafik
    │   ├── charts.js         # Grafik garis <canvas> buatan sendiri
    │   ├── i18n.js           # Kamus EN + ID
    │   ├── theme.js          # Toggle tema
    │   └── views.js          # Pergantian "halaman" (show/hide section)
    ├── sw.js                 # Service worker (cache-first shell)
    ├── manifest.webmanifest  # Manifest PWA
    ├── vendor/bootstrap/     # Bootstrap 5.3.3 (disimpan lokal, tanpa CDN)
    └── icons/                # Ikon PWA
```

---

## 3. Spesifikasi aplikasi

### 3.1 Bahasa pemrograman

| Lapisan            | Bahasa                                                        |
|--------------------|---------------------------------------------------------------|
| Backend / API      | **Python 3.12**                                               |
| Frontend logic     | **JavaScript (ES2020+, ES Modules)**, vanilla tanpa framework |
| Tampilan           | **HTML5** + **CSS3** (custom properties untuk tema)           |
| Konfigurasi server | **Nginx config**, **Dockerfile**, **YAML** (Docker Compose)   |
| Database           | **SQL** lewat ORM SQLAlchemy (SQLite)                         |

### 3.2 Teknologi & versi

| Komponen                   | Teknologi                              | Versi         |
|----------------------------|----------------------------------------|---------------|
| Web server / reverse proxy | Nginx (Alpine)                         | 1.27          |
| Runtime backend            | Python (Alpine)                        | 3.12          |
| Web framework              | Flask                                  | 3.0.3         |
| ORM                        | Flask-SQLAlchemy                       | 3.1.1         |
| WSGI server                | Gunicorn (2 worker, port 3000)         | 22.0.0        |
| Database                   | SQLite (satu file)                     | bawaan Python |
| UI framework               | Bootstrap (bundle, disimpan lokal)     | 5.3.3         |
| Grafik                     | Canvas 2D buatan sendiri (`charts.js`) | –             |
| PWA                        | Service Worker + Web App Manifest      | –             |
| Kontainer                  | Docker + Docker Compose                | –             |

### 3.3 Konfigurasi deployment (`docker-compose.yml`)

| Service         | Image                        | Port               | Network                                       | Batas resource    |
|-----------------|------------------------------|--------------------|-----------------------------------------------|-------------------|
| `bloodcare`     | build `./Dockerfile` (nginx) | host `8082` → `80` | `cloudflare` (external), `bloodcare-internal` | 2 GB RAM, 0.5 CPU |
| `bloodcare-api` | build `./backend/Dockerfile` | internal `3000`    | `bloodcare-internal`                          | 2 GB RAM, 0.5 CPU |

Environment variable backend:

| Variabel          | Fungsi                            | Default                                        |
|-------------------|-----------------------------------|------------------------------------------------|
| `DATA_DIR`        | Folder tempat file `bloodcare.db` | `/data` (Docker) atau `backend/data` (lokal)   |
| `DELETE_PASSWORD` | Password untuk menghapus akun     | kosong, artinya penghapusan **selalu ditolak** |

### 3.4 Model data (SQLite)

`accounts`

| Kolom        | Tipe                 | Keterangan                               |
|--------------|----------------------|------------------------------------------|
| `id`         | INTEGER PK           |                                          |
| `name`       | VARCHAR(120), UNIQUE | Keunikan dicek *case-insensitive* di API |
| `birth_date` | DATE                 | Umur dihitung otomatis (`Account.age`)   |
| `created_at` | DATETIME (UTC)       |                                          |

`blood_pressure_records`

| Kolom                    | Tipe                  | Keterangan                                     |
|--------------------------|-----------------------|------------------------------------------------|
| `id`                     | INTEGER PK            |                                                |
| `account_id`             | FK → `accounts.id`    | Ikut terhapus saat akun dihapus (cascade ORM)  |
| `systolic` / `diastolic` | INTEGER               | mmHg                                           |
| `pulse`                  | INTEGER, nullable     | bpm                                            |
| `category`               | VARCHAR(20)           | `normal`/`elevated`/`stage1`/`stage2`/`crisis` |
| `pulse_status`           | VARCHAR(10), nullable | `low`/`normal`/`high`                          |
| `created_at`             | DATETIME (UTC)        |                                                |

### 3.5 REST API

Semua endpoint memakai prefix `/api` dan format JSON.

| Method | Endpoint                     | Fungsi                                                                                       | Response penting                                 |
|--------|------------------------------|----------------------------------------------------------------------------------------------|--------------------------------------------------|
| GET    | `/api/health`                | Health check                                                                                 | `{"status":"ok"}`                                |
| GET    | `/api/accounts`              | Daftar semua akun (urut nama)                                                                | `200`                                            |
| POST   | `/api/accounts`              | Buat akun `{name, birth_date}`                                                               | `201`, `400 invalid_input`, `409 duplicate_name` |
| PUT    | `/api/accounts/<id>`         | Ubah akun                                                                                    | `200`, `400`, `404`, `409`                       |
| DELETE | `/api/accounts/<id>`         | Hapus akun + riwayat, body `{password}`                                                      | `200`, `403 invalid_delete_password`, `404`      |
| POST   | `/api/check`                 | Analisis bacaan `{systolic, diastolic, pulse?, account_id?}`, disimpan jika ada `account_id` | `200`, `400`, `404`                              |
| GET    | `/api/accounts/<id>/history` | Riwayat (terbaru dulu) + tren                                                                | `200`, `404`                                     |

### 3.6 Aturan bisnis

**Validasi input**

- Sistolik 40–300 mmHg, diastolik 20–200 mmHg, nadi 20–250 bpm (opsional), semuanya bilangan bulat.
- Nama wajib diisi, maksimal 120 karakter. Tanggal lahir berformat `YYYY-MM-DD` dan tidak boleh di masa depan.

**Klasifikasi tekanan darah (AHA/ACC). Kategori paling parah yang cocok yang dipakai:**

| Kategori | Kondisi                                   |
|----------|-------------------------------------------|
| Krisis   | Sistolik ≥ 180 **atau** diastolik ≥ 120   |
| Tahap 2  | Sistolik ≥ 140 **atau** diastolik ≥ 90    |
| Tahap 1  | Sistolik 130–139 **atau** diastolik 80–89 |
| Elevated | Sistolik 120–129 **dan** diastolik < 80   |
| Normal   | Selain di atas                            |

**Rentang normal nadi berdasarkan umur:** < 1 th: 100–160 · 1–2 th: 90–150 · 3–5 th: 80–140 · 6–10 th: 70–120 · 11–14 th: 60–105 · ≥ 15 th atau tanpa akun: 60–100.

**Tren:** skor (sistolik + diastolik) bacaan terakhir dibandingkan dengan rata-rata maksimal 3 bacaan sebelumnya. Selisih ≤ −5 berarti *membaik*, ≥ +5 berarti *memburuk*, selain itu *stabil*. Jika bacaan kurang dari 2, statusnya "data belum cukup".

### 3.7 Frontend & PWA

- **SPA satu halaman** dengan 3 view (Dashboard, Result, History) yang ditampilkan/disembunyikan lewat atribut `hidden`, tanpa router.
- **Tanpa build tool**: tidak ada npm, bundler, atau transpiler. File langsung disajikan Nginx.
- **Preferensi pengguna** (tema dan bahasa) disimpan di `localStorage` (`bloodcare_theme`, `bloodcare_lang`).
- **Service worker** (`bloodcare-shell-v1`): *precache* seluruh shell, *cache-first* untuk aset statis, `/api/` selalu ke jaringan, dan fallback ke `index.html` saat offline.
- **Manifest**: `display: standalone`, orientasi portrait, ikon 192/512/maskable/apple-touch.

---

## 4. Temuan audit

Diurutkan dari yang paling penting. Proyek ini belum memiliki git dan test otomatis. `PROJECT_STATUS.md` juga mencatat bahwa build belum pernah dijalankan saat penulisan, walaupun sudah ada file database berisi data.

### 🔴 Tinggi: keamanan & privasi

1. **Tidak ada autentikasi sama sekali.** Siapa pun yang bisa membuka URL (port `8082` di host, juga lewat network `cloudflare`) dapat melihat semua nama, tanggal lahir, dan riwayat tekanan darah seluruh akun, serta membuat dan mengubah akun. Ini **data kesehatan pribadi**. Sebaiknya dibatasi, misalnya dengan Cloudflare Access, basic auth di Nginx, atau login.
2. `DELETE_PASSWORD` **ditulis langsung (hardcode) di** `docker-compose.yml`**.** Password tersimpan sebagai teks biasa di file konfigurasi. Sebaiknya dipindah ke file `.env` yang tidak ikut dibagikan, atau memakai Docker secrets.
3. **Tidak ada rate limiting** pada `DELETE /api/accounts/<id>`, sehingga password hapus bisa ditebak berulang kali (*brute force*). Perbandingannya sudah memakai `hmac.compare_digest`, jadi aman dari *timing attack*, tetapi tidak dari percobaan berulang.
4. **Container backend berjalan sebagai root** (sudah tercatat di `PROJECT_STATUS.md`).
5. **Tidak ada security header** di Nginx (CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).

### 🟠 Sedang: fungsional / operasional

 6. **Cache service worker tidak pernah diperbarui otomatis.** `CACHE_NAME` tetap `bloodcare-shell-v1` dan strateginya *cache-first*, jadi setelah deploy ulang pengguna lama **tetap memakai JS/CSS versi lama** sampai nama cache diganti secara manual.
 7. **Volume named** `bloodcare-data` **dideklarasikan tetapi tidak dipakai.** Service justru memakai *bind mount* `./bloodcare-data:/data`. Ini tidak merusak apa pun, tetapi membingungkan dan tidak sesuai dengan deskripsi di `PROJECT_STATUS.md`.
 8. **Tidak ada root** `.dockerignore`**.** Saat build image nginx, seluruh folder proyek (termasuk `bloodcare-data/bloodcare.db`) ikut terkirim sebagai *build context*. File DB tidak masuk image karena `Dockerfile` hanya menyalin `frontend/`, tetapi prosesnya tidak efisien dan berisiko.
 9. **Pesan error yang salah di form akun.** Di `frontend/js/accounts.js`, jika nama atau tanggal lahir kosong saat membuat atau mengubah akun, yang muncul adalah `error.required_bp` ("Masukkan nilai sistolik dan diastolik"), bukan pesan tentang nama/tanggal lahir.
10. **Hipotensi tidak terdeteksi.** Klasifikasi hanya mengenali tekanan tinggi. Bacaan rendah seperti 85/50 tetap dianggap *Normal*.
11. **SQLite + 2 worker Gunicorn.** Cukup untuk skala keluarga, tetapi `db.create_all()` dijalankan di setiap worker saat startup, dan SQLite mengunci seluruh file saat menulis. Tidak cocok jika penggunanya banyak.
12. **Tidak ada backup database.** Semua data ada di satu file `bloodcare-data/bloodcare.db`.

### 🟡 Rendah: kualitas kode

13. `datetime.utcnow()` (models.py) sudah *deprecated* di Python 3.12, dan `Model.query.get()` termasuk API lama SQLAlchemy 2.x. Keduanya masih berjalan, tetapi memunculkan peringatan.
14. Cascade hapus hanya ditangani ORM. `PRAGMA foreign_keys` SQLite tidak diaktifkan, jadi integritas relasi tidak dijaga di level database.
15. Endpoint riwayat tidak memakai paginasi, sehingga seluruh riwayat dikirim sekaligus.
16. Warna `theme-color` tema terang di `theme.js` (`#FDF6EC`) tidak sama dengan palet terang di CSS/catatan (`#ffffff` / `#f8fafc`).
17. `openDeleteModal()` memanggil `passwordInput.focus()` sebelum modal tampil, jadi fokus tidak berpindah ke kolom password.
18. Belum ada test otomatis (unit test untuk `classification.py` dan `validators.py` mudah dibuat) dan belum ada version control (git).

### ✅ Hal yang sudah baik

- Struktur backend rapi: application factory, blueprint, service, dan validator terpisah.
- Validasi input dilakukan di server dan di client.
- Frontend aman dari XSS: data pengguna dirender dengan `textContent`, bukan `innerHTML`.
- i18n dirancang dengan baik: backend hanya mengirim ID stabil, penerjemahan di client.
- Tidak bergantung pada CDN (Bootstrap disimpan lokal) dan grafik dibuat sendiri, sehingga offline-friendly dan ringan.
- Backend tidak diekspos langsung ke luar, hanya lewat network internal dan proxy Nginx.
- Error API konsisten dalam format JSON `{error, message}`.

---

## 5. Cara menjalankan

```bash
# Network eksternal 'cloudflare' harus sudah ada
docker network create cloudflare   # jika belum ada

docker compose up -d --build
# Buka http://localhost:8082
# Health check: http://localhost:8082/api/health
```

Menjalankan backend tanpa Docker (untuk pengembangan):

```bash
cd backend
pip install -r requirements.txt
python app.py        # listen di :3000, DB di backend/data/bloodcare.db
```

> Catatan: jika backend dijalankan tanpa Nginx, frontend perlu diproxy ke `/api`, karena `api.js` memakai path relatif `/api`.
