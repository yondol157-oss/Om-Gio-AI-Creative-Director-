# OM GIO AI CREATIVE DIRECTOR

> **AI Creative Production Studio** untuk menghasilkan konten, visual, video, prompt, influencer, storyboard, dan materi kreatif dalam satu workspace.

---

## 📑 DAFTAR ISI

1. [Gambaran Arsitektur](#1-gambaran-arsitektur)
2. [Instalasi & Menjalankan Development](#2-instalasi--menjalankan-development)
3. [Setup Database Relasional (PostgreSQL & Integrated Engine)](#3-setup-database-relasional)
4. [Setup Autentikasi Google OAuth](#4-setup-autentikasi-google-oauth)
5. [Setup AI API Key (Server-Side Keamanan Penuh)](#5-setup-ai-api-key)
6. [Setup Payment Gateway Lynk](#6-setup-payment-gateway-lynk)
7. [Setup Webhook & Idempotency](#7-setup-webhook--idempotency)
8. [Cara Membuat & Mengelola Akun Admin](#8-cara-membuat--mengelola-akun-admin)
9. [Deployment ke Cloud (GCP / Docker / VPS)](#9-deployment-ke-cloud)
10. [Strategi Backup Database & Data Studio](#10-strategi-backup-database--data-studio)
11. [Cara Mengubah Harga (Pricing Pro Lifetime)](#11-cara-mengubah-harga)
12. [Cara Menambahkan / Mengganti Provider AI](#12-cara-menambahkan--mengganti-provider-ai)

---

## 1. Gambaran Arsitektur

```
[ Browser / Client ]
       │
       ▼ (Google Login / JWT Bearer)
[ Express API Server (server.ts) ]
       │
  ┌────┴──────────────────────────────┐
  ▼                                   ▼
[ Relational DB Layer ]     [ Server-Side AI Service ]
(Users, Payments, Projects,        (@google/genai)
 Storyboards, Characters)             │
                                      ▼
                           [ Google Gemini Studio API ]
                           - gemini-3.8-flash (Text / Prompts)
                           - gemini-3.1-flash-lite-image (Images)
```

- **Keamanan Ketat API Key:** Pelanggan tidak pernah melihat, memasukkan, atau menerima API key dari browser. Semua komputasi AI diproses di sisi server.
- **Model Bisnis SaaS:** Pembeli melakukan checkout paket **PRO LIFETIME** di Lynk, kemudian akun Google mereka diverifikasi secara otomatis (webhook) atau manual melalui Admin Panel untuk mendapatkan lisensi permanen tanpa batas waktu kadaluarsa.

---

## 2. Instalasi & Menjalankan Development

### Persyaratan Sistem
- Node.js v20+ atau v22+
- npm atau bun

### Langkah Install
```bash
# 1. Clone repository
git clone <repo-url>
cd om-gio-ai-creative-director

# 2. Salin environment variables
cp .env.example .env

# 3. Jalankan development server (port 3000)
npm run dev
```

Buka browser Anda di `http://localhost:3000`.

---

## 3. Setup Database Relasional

Aplikasi menggunakan engine penyimpanan relasional dengan skema terstruktur:
- `users`: Google auth, role (`ADMIN`, `PRO`, `USER`, `SUSPENDED`), membership lifetime status.
- `payments`: ID transaksi Lynk, nominal, status (`PENDING`, `VERIFIED`, `PAID`).
- `projects`: Workspace isolasi multi-user dengan hak akses kepemilikan.
- `characters`: Profil DNA visual AI Influencer (wajah, ras, mata, gaya rambut).
- `storyboards`: Kisi storyboard multi-shot dengan aksi, durasi, dan visual.
- `assets`: Manajemen gambar, botol produk affiliate, pakaian, dan lokasi.
- `prompts`: Library naskah prompt kustom dan template viral.
- `audit_logs`: Audit jejak transaksi dan aksi admin.

Jika ingin menghubungkan ke database PostgreSQL eksternal (Supabase/Neon/GCP Cloud SQL), cukup isi `DATABASE_URL` di file `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/om_gio_studio"
```

---

## 4. Setup Autentikasi Google OAuth

1. Kunjungi [Google Cloud Console](https://console.cloud.google.com/).
2. Buat OAuth 2.0 Client ID untuk tipe **Web Application**.
3. Tambahkan Authorized JavaScript Origins:
   `https://domain-anda.com` atau `http://localhost:3000`
4. Masukkan kredensial ke `.env`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

---

## 5. Setup AI API Key (Server-Side Keamanan Penuh)

Aplikasi menggunakan model resmi `@google/genai`:
- **Text & Prompt Generator:** `gemini-3.8-flash`
- **Complex Storyboard & Reasoning:** `gemini-3.1-pro-preview`
- **Image Generation:** `gemini-3.1-flash-lite-image`

Dapatkan API Key di [Google AI Studio](https://aistudio.google.com/) dan set di file `.env`:
```env
GEMINI_API_KEY="AIzaSy..."
```
> **PENTING:** API Key ini hanya boleh ada di file `.env` server dan tidak pernah di-bundle ke client script.

---

## 6. Setup Payment Gateway Lynk

1. Buka akun di [Lynk.id](https://lynk.id/).
2. Buat produk digital: **OM GIO AI PRO LIFETIME**.
3. Atur harga produk (misal: **Rp 249.000**).
4. Ambil URL checkout produk Anda dan masukkan ke `.env`:
   ```env
   PAYMENT_PROVIDER_URL="https://lynk.id/omgio/s/pro-lifetime"
   PAYMENT_PROVIDER_SECRET="secret_webhook_lynk"
   ```

---

## 7. Setup Webhook & Idempotency

Endpoint Webhook: `POST /api/payments/webhook`

Headers:
- `x-lynk-signature`: HMAC-SHA256 signature dari payload request.

Payload contoh dari Lynk:
```json
{
  "event": "payment.success",
  "customer_email": "user@gmail.com",
  "transaction_id": "LYNK-TX-992819",
  "amount": 249000,
  "status": "PAID"
}
```
Ketika webhook diterima:
1. Signature diverifikasi dengan `PAYMENT_PROVIDER_SECRET`.
2. Akun user dengan email tersebut otomatis diaktifkan menjadi `PRO_LIFETIME`.
3. `lifetime_access = true`, `expires_at = null`.
4. Transaksi bersifat **idempotent** (panggilan ganda tidak akan menduplikasi membership).

### Fallback Manual Verification
Jika webhook belum aktif, user dapat menginput nomor referensi transaksi di halaman **Profile & Membership** → Admin dapat melihat bukti dan menekan **"Verify & Aktifkan Pro"** di Admin Panel.

---

## 8. Cara Membuat & Mengelola Akun Admin

Untuk menentukan email akun Master Admin pertama kali, atur environment variable:
```env
ADMIN_EMAIL="email-anda@gmail.com"
```
Saat user dengan email tersebut login, sistem otomatis memberikan role `ADMIN` dengan akses permanen ke Admin Control Panel (`/api/admin/*`).

---

## 9. Deployment ke Cloud

### Build Production
```bash
npm run build
npm start
```
`server.ts` akan melayani bundle static yang sudah di-optimize di folder `dist` dan port yang disesuaikan dari variabel environment `PORT` (default 3000).

---

## 10. Strategi Backup Database & Data Studio

File database tersimpan di path `data/om_gio_studio.json`.
Untuk backup berkala, gunakan cron job server:
```bash
# Backup otomatis setiap malam pukul 00:00
0 0 * * * tar -czf /backups/om_gio_$(date +\%F).tar.gz /path/to/app/data
```

---

## 11. Cara Mengubah Harga

Admin dapat mengubah harga secara dinamis tanpa perlu deploy ulang:
1. Masuk sebagai **ADMIN**.
2. Buka menu **Admin Control Panel** → **System Settings**.
3. Ubah kolom **Harga Display Pro Lifetime** (misal: `Rp 299.000`) dan URL Lynk.
4. Klik **Simpan Perubahan**.

---

## 12. Cara Menambahkan / Mengganti Provider AI

1. Buka **Admin Control Panel** → **AI Providers & Models**.
2. Pilih provider (misal Google Gemini atau kustom).
3. Anda dapat memilih model teks aktif (`gemini-3.8-flash` atau `gemini-3.1-pro-preview`) dan model gambar aktif (`gemini-3.1-flash-lite-image`).
4. Klik **Test Connection** untuk memverifikasi latensi dan responsivitas API.
