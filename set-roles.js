/**
 * set-roles.js
 * ------------------------------------------------------------
 * Menetapkan PERAN (custom claims) ke akun Firebase Authentication.
 * Peran inilah yang dibaca oleh Security Rules & aplikasi.
 *
 * Ini WAJIB dijalankan di komputer tepercaya (bukan di browser),
 * karena hanya Admin SDK yang boleh menulis custom claims.
 *
 * ============================================================
 * CARA PAKAI (sekali setup):
 *
 * 1. Pastikan Node.js terpasang (cek: node -v).
 *
 * 2. Buat folder kerja, taruh file ini di dalamnya, lalu:
 *      npm init -y
 *      npm install firebase-admin
 *
 * 3. Ambil Service Account Key:
 *      Firebase Console > Project settings (gear) > Service accounts
 *      > "Generate new private key" > simpan sebagai
 *      serviceAccountKey.json di folder yang sama.
 *      ⚠️ JANGAN commit / sebar file ini. Ini kunci penuh database.
 *
 * 4. Buat dulu akun petugas di:
 *      Console > Authentication > Users > Add user (email + password)
 *
 * 5. Jalankan, contoh:
 *      node set-roles.js admin@gkps.id admin
 *      node set-roles.js manager@gkps.id manager
 *      node set-roles.js petugas1@gkps.id scanner
 *
 *    Peran valid: admin | manager | scanner
 *
 * 6. Minta user logout lalu login lagi di aplikasi agar token
 *    yang baru (berisi peran) terbaca. (Aplikasi sudah memanggil
 *    getIdTokenResult(user, true) untuk memaksa refresh token.)
 * ============================================================
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const VALID_ROLES = ['admin', 'manager', 'scanner'];

async function main() {
  const email = process.argv[2];
  const role = process.argv[3];

  if (!email || !role) {
    console.error('Pemakaian: node set-roles.js <email> <admin|manager|scanner>');
    process.exit(1);
  }
  if (!VALID_ROLES.includes(role)) {
    console.error(`Peran tidak valid: "${role}". Pilih salah satu: ${VALID_ROLES.join(', ')}`);
    process.exit(1);
  }

  try {
    const user = await admin.auth().getUserByEmail(email);

    // Set HANYA satu peran utama. (admin sudah mencakup manager & scanner
    // di sisi aplikasi & rules, jadi cukup beri 'admin'.)
    const claims = { admin: false, manager: false, scanner: false };
    claims[role] = true;

    await admin.auth().setCustomUserClaims(user.uid, claims);
    console.log(`✅ Berhasil: ${email} sekarang berperan "${role}".`);
    console.log('   Minta user logout & login ulang agar peran aktif.');
  } catch (e) {
    console.error('❌ Gagal:', e.message);
    process.exit(1);
  }
  process.exit(0);
}

main();
