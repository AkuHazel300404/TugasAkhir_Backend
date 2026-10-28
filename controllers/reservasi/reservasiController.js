const ReservasiModel = require('../../models/reservasi/reservasiModel');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s]{8,16}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const todayLocal = () => new Date().toLocaleDateString('en-CA');

const validateBooking = (body) => {
    const { id_kamar, tanggal_reservasi, nama_lengkap, nomor_hp, email, nama_ortu, nomor_hp_ortu } = body;

    if (!id_kamar) return 'Kamar wajib dipilih';
    if (!tanggal_reservasi || !DATE_REGEX.test(tanggal_reservasi)) return 'Tanggal masuk tidak valid';
    if (tanggal_reservasi < todayLocal()) return 'Tanggal masuk tidak boleh di masa lalu';
    if (!nama_lengkap?.trim()) return 'Nama lengkap wajib diisi';
    if (!PHONE_REGEX.test(nomor_hp || '')) return 'Nomor telepon tidak valid';
    if (!EMAIL_REGEX.test(email || '')) return 'Format email tidak valid';
    if (!nama_ortu?.trim()) return 'Nama orang tua/penanggung jawab wajib diisi';
    if (!PHONE_REGEX.test(nomor_hp_ortu || '')) return 'Nomor telepon orang tua/penanggung jawab tidak valid';
    return null;
};

const handleError = (res, error, label) => {
    if (error instanceof ReservasiModel.BookingError) {
        return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error(`${label} error:`, error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
};

const parseId = (req, res) => {
    const id = Number(req.params.id_reservasi);
    if (!Number.isInteger(id) || id < 1) {
        res.status(400).json({ success: false, message: 'ID reservasi tidak valid' });
        return null;
    }
    return id;
};

const ReservasiController = {
    getAll: async (req, res) => {
        try {
            const reservasi = await ReservasiModel.getAll();
            res.status(200).json({ data: reservasi, message: 'Berhasil mengambil data reservasi' });
        } catch (error) {
            handleError(res, error, 'Reservasi getAll');
        }
    },

    getMine: async (req, res) => {
        try {
            const reservasi = await ReservasiModel.getByUser(req.user.id);
            res.status(200).json({ data: reservasi });
        } catch (error) {
            handleError(res, error, 'Reservasi getMine');
        }
    },

    // id_user diambil dari token (req.user.id), BUKAN dari body
    create: async (req, res) => {
        try {
            const pesanError = validateBooking(req.body);
            if (pesanError) {
                return res.status(400).json({ success: false, message: pesanError });
            }
            const result = await ReservasiModel.create(req.body, req.user.id);
            res.status(201).json({
                success: true,
                data: result,
                message: 'Reservasi berhasil dibuat, menunggu konfirmasi pengelola',
            });
        } catch (error) {
            handleError(res, error, 'Reservasi create');
        }
    },

    approve: async (req, res) => {
        const id = parseId(req, res);
        if (id === null) return;
        try {
            const result = await ReservasiModel.approve(id);
            res.status(200).json({ success: true, data: result, message: 'Reservasi disetujui, kamar berstatus reserved' });
        } catch (error) {
            handleError(res, error, 'Reservasi approve');
        }
    },

    reject: async (req, res) => {
        const id = parseId(req, res);
        if (id === null) return;
        try {
            const result = await ReservasiModel.reject(id);
            res.status(200).json({ success: true, data: result, message: 'Reservasi ditolak' });
        } catch (error) {
            handleError(res, error, 'Reservasi reject');
        }
    },

    cancelByAdmin: async (req, res) => {
        const id = parseId(req, res);
        if (id === null) return;
        try {
            const result = await ReservasiModel.cancelApproved(id);
            res.status(200).json({ success: true, data: result, message: 'Reservasi dibatalkan oleh admin' });
        } catch (error) {
            handleError(res, error, 'Reservasi cancelByAdmin');
        }
    },

    cancel: async (req, res) => {
        const id = parseId(req, res);
        if (id === null) return;
        try {
            const result = await ReservasiModel.cancel(id, req.user.id);
            res.status(200).json({ success: true, data: result, message: 'Reservasi dibatalkan' });
        } catch (error) {
            handleError(res, error, 'Reservasi cancel');
        }
    },
};

module.exports = ReservasiController;