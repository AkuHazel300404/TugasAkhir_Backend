const KamarModel = require('../../models/kamar/kamarModel');
const path = require('path');
const { handleError } = require('../../utils/httpError');
const { removeFile, UPLOAD_DIR } = require('../../auth/middlewares/uploadMiddleware');

// Kolom internal yang tidak boleh dilihat pengunjung maupun user biasa
const hidePrivateFields = ({ notes, ...publicFields }) => publicFields;

// Kolom yang NOT NULL di tabel kamar harus diisi, kalau tidak MySQL menolak dengan 500.
const REQUIRED_FIELDS = {
    nomor_kamar: 'Nomor kamar',
    id_tipe_kamar: 'Tipe kamar',
    kapasitas: 'Kapasitas',
    luas_kamar: 'Luas kamar',
};
const PRICE_FIELDS = { harga_per_malam: 'Harga per malam', harga_per_bulan: 'Harga per bulan', jumlah_deposit: 'Deposit' };
const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';

// Mengembalikan pesan error (string) atau null jika input valid
const validateKamar = (body = {}) => {
    for (const [field, label] of Object.entries(REQUIRED_FIELDS)) {
        if (isBlank(body[field])) return `${label} wajib diisi`;
    }
    if (!Number.isInteger(Number(body.id_tipe_kamar)) || Number(body.id_tipe_kamar) < 1) return 'Tipe kamar tidak valid';
    if (!Number.isInteger(Number(body.kapasitas)) || Number(body.kapasitas) < 1) return 'Kapasitas harus berupa bilangan bulat minimal 1';
    if (!(Number(body.luas_kamar) > 0)) return 'Luas kamar harus berupa angka lebih dari 0';
    for (const [field, label] of Object.entries(PRICE_FIELDS)) {
        if (!isBlank(body[field]) && !(Number(body[field]) >= 0)) return `${label} harus berupa angka tidak negatif`;
    }
    return null;
};

// Kolom harga/deposit yang dikosongkan di form (string kosong) harus menjadi NULL,
// karena MySQL menolak '' untuk kolom DECIMAL.
const normalizeKamar = (body = {}) => {
    const data = { ...body };
    for (const field of Object.keys(PRICE_FIELDS)) {
        if (isBlank(data[field])) data[field] = null;
    }
    return data;
};

const KamarController = {

    // Publik. Pengunjung dan user hanya melihat kamar aktif tanpa catatan internal.
    // Admin (dikenali lewat optionalAuth di route) melihat semuanya.
    getAll: async (req, res) => {
        try {
            const isAdmin = req.user?.role === 'admin';
            const filters = { ...req.query };
            if (!isAdmin) filters.is_active = 1;

            const kamar = await KamarModel.getAll(filters);
            const data = isAdmin ? kamar : kamar.map(hidePrivateFields);
            return res.status(200).json({ data, total: data.length });
        } catch (error) {
            return handleError(res, error, 'Kamar getAll');
        }
    },

    getById: async (req, res) => {
        try {
            const isAdmin = req.user?.role === 'admin';
            const kamar = await KamarModel.getById(req.params.id_kamar);

            if (!kamar || (!isAdmin && !kamar.is_active)) {
                return res.status(404).json({ message: 'Kamar tidak ditemukan' });
            }
            return res.status(200).json({ data: isAdmin ? kamar : hidePrivateFields(kamar) });
        } catch (error) {
            return handleError(res, error, 'Kamar getById');
        }
    },

    create: async (req, res) => {
        const pesan = validateKamar(req.body);
        if (pesan) return res.status(400).json({ success: false, message: pesan });

        try {
            const result = await KamarModel.create(normalizeKamar(req.body));
            return res.status(201).json({ data: result, message: 'Kamar berhasil dibuat' });
        } catch (error) {
            return handleError(res, error, 'Kamar create');
        }
    },

    update: async (req, res) => {
        const pesan = validateKamar(req.body);
        if (pesan) return res.status(400).json({ success: false, message: pesan });

        try {
            const { id_kamar } = req.params;
            const result = await KamarModel.update(id_kamar, normalizeKamar(req.body));
            return res.status(200).json({ data: result, message: 'Kamar berhasil diperbarui' });
        } catch (error) {
            return handleError(res, error, 'Kamar update');
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { id_kamar } = req.params;
            const result = await KamarModel.updateStatus(id_kamar, req.body.status);
            return res.status(200).json({ data: result, message: 'Status kamar berhasil diubah' });
        } catch (error) {
            return handleError(res, error, 'Kamar updateStatus');
        }
    },

    activate: async (req, res) => {
        try {
            const { id_kamar } = req.params;
            const result = await KamarModel.activate(id_kamar);
            return res.status(200).json({ data: result, message: 'Kamar berhasil diaktifkan' });
        } catch (error) {
            return handleError(res, error, 'Kamar activate');
        }
    },

    deactivate: async (req, res) => {
        try {
            const { id_kamar } = req.params;
            const result = await KamarModel.deactivate(id_kamar);
            return res.status(200).json({ data: result, message: 'Kamar berhasil dinonaktifkan' });
        } catch (error) {
            return handleError(res, error, 'Kamar deactivate');
        }
    },

    delete: async (req, res) => {
        try {
            const { id_kamar } = req.params;
            const { foto } = await KamarModel.delete(id_kamar);

            // Bersihkan file foto dari disk setelah baris database berhasil dihapus.
            // path.basename mencegah path dari database keluar dari folder uploads.
            await Promise.all(foto.map((p) => removeFile(path.join(UPLOAD_DIR, path.basename(p)))));

            return res.status(200).json({ message: 'Kamar berhasil dihapus' });
        } catch (error) {
            return handleError(res, error, 'Kamar delete');
        }
    },
};

module.exports = KamarController;