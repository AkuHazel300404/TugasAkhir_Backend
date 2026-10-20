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
const UserModel = require('./models/userModel');

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
        const existing = await UserModel.getByEmail(email);
        if (existing) {
            console.error(`User dengan email "${email}" sudah ada. Batal membuat user baru.`);
            process.exit(1);
        }

        await UserModel.create({ nama, email, password });
        console.log(`User "${nama}" (${email}) berhasil dibuat. Silakan login lewat /api/auth/login.`);
        process.exit(0);
    } catch (error) {
        console.error('Gagal membuat user:', error.message);
        process.exit(1);
    }
};

run();