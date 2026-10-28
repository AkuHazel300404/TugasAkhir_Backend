// Error buatan sendiri yang pesannya AMAN ditampilkan ke client
// (contoh: "User tidak ditemukan.", "Kamar masih terpakai").
class AppError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.name = 'AppError';
        this.status = status;
    }
}

// Error batasan database yang sebenarnya kesalahan input, bukan kerusakan server.
// Dijawab 4xx dengan pesan aman (tanpa SQL, nama tabel, atau nama kolom).
const DB_ERRORS = {
    ER_BAD_NULL_ERROR: [400, 'Ada data wajib yang belum diisi'],
    ER_NO_REFERENCED_ROW_2: [400, 'Data rujukan tidak ditemukan (misalnya tipe kamar tidak valid)'],
    ER_DUP_ENTRY: [409, 'Data tersebut sudah ada'],
    ER_ROW_IS_REFERENCED_2: [409, 'Data masih digunakan oleh data lain sehingga tidak dapat diubah atau dihapus'],
    ER_DATA_TOO_LONG: [400, 'Ada data yang terlalu panjang'],
    WARN_DATA_TRUNCATED: [400, 'Ada nilai yang tidak valid'],
};

// Dipakai di blok catch controller. Hanya AppError yang pesannya dikirim ke client;
// error lain (database, bug kode) dicatat di terminal server dan dijawab generik.
const handleError = (res, error, context = 'Request') => {
    if (error instanceof AppError) {
        return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error(`${context} error:`, error);
    const known = DB_ERRORS[error?.code];
    if (known) return res.status(known[0]).json({ success: false, message: known[1] });
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
};

module.exports = { AppError, handleError };