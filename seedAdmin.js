// Script sekali-pakai untuk membuat admin pertama, dijalankan langsung dari
// terminal (bukan lewat HTTP endpoint), supaya endpoint /admin/register bisa
// tetap diproteksi authenticate + authorize('admin') tanpa masalah ayam-telur.
//
// Cara pakai:
//   node seedAdmin.js "Nama Admin" admin@example.com PasswordAman123
//
// Setelah admin pertama berhasil dibuat, script ini sudah tidak diperlukan lagi
// untuk admin berikutnya — pakai POST /api/admin/register (sudah login sebagai admin).

require('dotenv').config();
const AdminModel = require('./models/adminModel');

const MIN_PASSWORD_LENGTH = 8;

const run = async () => {
    const [nama, email, password] = process.argv.slice(2);

    if (!nama || !email || !password) {
        console.error('Pemakaian: node seedAdmin.js "Nama Admin" email@example.com password');
        process.exit(1);
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
        console.error(`Password minimal ${MIN_PASSWORD_LENGTH} karakter.`);
        process.exit(1);
    }

    try {
        const existing = await AdminModel.getByEmail(email);
        if (existing) {
            console.error(`Admin dengan email "${email}" sudah ada. Batal membuat admin baru.`);
            process.exit(1);
        }

        await AdminModel.create({ nama, email, password });
        console.log(`Admin "${nama}" (${email}) berhasil dibuat. Silakan login lewat /api/auth/admin/login.`);
        process.exit(0);
    } catch (error) {
        console.error('Gagal membuat admin:', error.message);
        process.exit(1);
    }
};

run();