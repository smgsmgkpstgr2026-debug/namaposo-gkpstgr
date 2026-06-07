# Panduan Setup Keamanan — Opsi A (Login Email + Custom Claims)

Project Firebase: **namaposo-gkpstgr**

Aplikasi sudah diubah dari "login PIN" menjadi "login email/password dengan peran berbasis custom claims". Agar berfungsi penuh dan benar-benar aman, ada 3 bagian yang harus disiapkan. Bagian 1 & 2 dilakukan sekali di Firebase Console + komputer Anda; bagian 3 (file HTML) sudah selesai saya kerjakan.

---

## Bagian 1 — Aktifkan metode login di Firebase Console

Buka Firebase Console → project `namaposo-gkpstgr` → menu **Authentication** → tab **Sign-in method**, lalu aktifkan dua hal:

1. **Email/Password** → aktifkan. Ini untuk login petugas & admin.
2. **Anonymous** → aktifkan. Ini dipakai diam-diam agar peserta umum tetap bisa membuka "QR Saya" dan "Live" tanpa membuat akun.

Kalau **Anonymous** tidak diaktifkan, halaman publik (QR Saya & Live) tidak akan bisa membaca data.

---

## Bagian 2 — Buat akun petugas & beri peran

### 2a. Buat akun
Console → **Authentication** → **Users** → **Add user**. Masukkan email + password untuk tiap pengurus/petugas. Contoh:
- `admin@gkps.id`
- `petugas1@gkps.id`

### 2b. Beri peran dengan script `set-roles.js`
Peran (admin/manager/scanner) **tidak bisa** diberikan dari aplikasi — hanya lewat Admin SDK di komputer Anda. Ikuti komentar di file `set-roles.js`. Ringkasnya:

```bash
npm init -y
npm install firebase-admin
# letakkan serviceAccountKey.json (dari Console > Service accounts) di folder ini
node set-roles.js admin@gkps.id admin
node set-roles.js petugas1@gkps.id scanner
```

Peran yang tersedia: `admin`, `manager`, `scanner`.
- **admin** — akses penuh (kelola peserta, hapus, buka/tutup sesi).
- **manager** — kelola peserta & dashboard, tanpa hapus massal/kontrol sesi.
- **scanner** — hanya melakukan check-in (scan).

Setelah diberi peran, user perlu **logout lalu login lagi** agar token barunya aktif.

> ⚠️ `serviceAccountKey.json` adalah kunci penuh database. Jangan sebar, jangan commit ke GitHub, jangan taruh di dalam file HTML.

---

## Bagian 3 — Pasang Security Rules

Console → **Firestore Database** → tab **Rules** → tempel isi `firestore.rules` (versi custom claims) → **Publish**.

Rules ini mengunci di server: hapus peserta hanya untuk admin, check-in hanya untuk scanner ke atas, log absensi tidak bisa diubah/dihapus, dan peran tak bisa dipalsukan dari browser.

---

## Yang berubah di aplikasi (sudah selesai)

- Modal login PIN → diganti form **email + password**, dengan pesan error yang jelas.
- Peran dibaca dari **token claims** (`onAuthStateChanged` → `getIdTokenResult`).
- Tombol "Ganti PIN" → diganti **"Reset Password"** (kirim email reset via Firebase).
- Panel "Petugas Scan" (yang dulu menyimpan PIN plaintext) → diganti panel informasi yang mengarahkan ke Console + `set-roles.js`.
- Logout kini `signOut()` lalu login anonim lagi, sehingga halaman publik tetap jalan.
- Penulisan PIN default ke `admin_settings` dihapus, jadi tidak ada lagi PIN tersimpan di database.
- Koleksi `gkps_scanners` tidak dipakai lagi (boleh dihapus manual di Console kalau mau).

---

## Catatan migrasi data

Project `namaposo-gkpstgr` ini database-nya kosong. Data peserta dari project lama tidak ikut pindah. Setelah login admin berfungsi, import ulang CSV peserta lewat fitur Import di dashboard.

## Urutan tes yang disarankan

1. Aktifkan Email/Password + Anonymous (Bagian 1).
2. Pasang Rules (Bagian 3).
3. Buka aplikasi tanpa login → coba "QR Saya" & "Live" → harus tetap bisa baca.
4. Buat akun admin + beri peran admin (Bagian 2).
5. Login admin di aplikasi → tambah 1 peserta → buka sesi → coba check-in.
6. Cek di Console bahwa dokumen `gkps_attendance_logs` bertambah dan tidak bisa diubah.
