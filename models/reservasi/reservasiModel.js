const db = require('../../config/db');
const {AppError} = require('../../utils/httpError');

class BookingError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.name = 'BookingError';
        this.status = status;
    }
}

const BOOKABLE_STATUS = ['empty', 'available'];

// Menjalankan fn di dalam transaksi; commit jika sukses, rollback jika error
const inTransaction = async (fn) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const result = await fn(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const lockReservasi = async (connection, id_reservasi) => {
    const [[reservasi]] = await connection.query(
        'SELECT * FROM reservasi WHERE id_reservasi = ? FOR UPDATE',
        [id_reservasi]
    );
    if (!reservasi) throw new BookingError('Reservasi tidak ditemukan', 404);
    return reservasi;
};

const ReservasiModel = {
    BookingError,

    getAll: async () => {
        const [rows] = await db.query(`
            SELECT r.*, k.nomor_kamar
            FROM reservasi r
            LEFT JOIN kamar k ON r.id_kamar = k.id_kamar
            ORDER BY r.id_reservasi DESC
        `);
        return rows;
    },

    getByUser: async (id_user) => {
        const [rows] = await db.query(`
            SELECT r.*, k.nomor_kamar, k.harga_per_bulan, k.jumlah_deposit, t.nama AS tipe_kamar
            FROM reservasi r
            LEFT JOIN kamar k ON r.id_kamar = k.id_kamar
            LEFT JOIN tipe_kamar t ON k.id_tipe_kamar = t.id_tipe_kamar
            WHERE r.id_user = ?
            ORDER BY r.id_reservasi DESC
        `, [id_user]);
        return rows;
    },

    create: async (data, id_user) => {
        const {
            id_kamar, tanggal_reservasi, nama_lengkap,
            nomor_hp, email, nama_ortu, nomor_hp_ortu,
        } = data;

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [[user]] = await connection.query(
                'SELECT id_user, is_blacklist FROM user WHERE id_user = ?',
                [id_user]
            );
            if (!user) throw new BookingError('Akun tidak ditemukan, silakan login ulang', 401);
            if (user.is_blacklist) throw new BookingError('Akun kamu tidak dapat melakukan reservasi', 403);

            // FOR UPDATE: kunci baris kamar supaya 2 orang tidak memesan di detik yang sama
            const [[kamar]] = await connection.query(
                'SELECT id_kamar, status, is_active FROM kamar WHERE id_kamar = ? FOR UPDATE',
                [id_kamar]
            );
            if (!kamar) throw new BookingError('Kamar tidak ditemukan', 404);
            if (!kamar.is_active || !BOOKABLE_STATUS.includes(kamar.status)) {
                throw new BookingError('Kamar ini sedang tidak tersedia', 409);
            }

            const [[duplikat]] = await connection.query(
                `SELECT id_reservasi FROM reservasi
                 WHERE id_kamar = ? AND id_user = ? AND status IN ('pending','approved') LIMIT 1`,
                [id_kamar, id_user]
            );
            if (duplikat) throw new BookingError('Kamu sudah punya reservasi aktif untuk kamar ini', 409);

            const [[sudahDisetujui]] = await connection.query(
                `SELECT id_reservasi FROM reservasi
                 WHERE id_kamar = ? AND status = 'approved' LIMIT 1`,
                [id_kamar]
            );
            if (sudahDisetujui) throw new BookingError('Kamar ini sudah dipesan orang lain', 409);

            const [result] = await connection.query(
                `INSERT INTO reservasi
                    (id_kamar, id_user, tanggal_reservasi, nama_lengkap, nomor_hp, email, nama_ortu, nomor_hp_ortu, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
                [id_kamar, id_user, tanggal_reservasi, nama_lengkap, nomor_hp, email, nama_ortu, nomor_hp_ortu]
            );

            await connection.commit();
            return { id_reservasi: result.insertId, status: 'pending' };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // Admin menyetujui: reservasi -> approved, kamar -> reserved,
    // dan reservasi pending lain untuk kamar yang sama otomatis ditolak.
    approve: (id_reservasi) => inTransaction(async (connection) => {
        // Urutan kunci sama dengan create(): kamar dulu, baru reservasi (cegah deadlock)
        const [[awal]] = await connection.query(
            'SELECT id_kamar FROM reservasi WHERE id_reservasi = ?', [id_reservasi]
        );
        if (!awal) throw new BookingError('Reservasi tidak ditemukan', 404);

        const [[kamar]] = await connection.query(
            'SELECT id_kamar, status, is_active FROM kamar WHERE id_kamar = ? FOR UPDATE',
            [awal.id_kamar]
        );
        if (!kamar) throw new BookingError('Kamar tidak ditemukan', 404);

        const reservasi = await lockReservasi(connection, id_reservasi);
        if (reservasi.status !== 'pending') {
            throw new BookingError(`Reservasi berstatus "${reservasi.status}" tidak dapat disetujui`, 409);
        }
        if (!kamar.is_active || !BOOKABLE_STATUS.includes(kamar.status)) {
            throw new BookingError('Kamar sudah tidak tersedia, reservasi tidak dapat disetujui', 409);
        }

        await connection.query(
            "UPDATE reservasi SET status = 'approved' WHERE id_reservasi = ?", [id_reservasi]
        );
        await connection.query(
            "UPDATE kamar SET status = 'reserved', updated_at = NOW() WHERE id_kamar = ?", [kamar.id_kamar]
        );
        const [lain] = await connection.query(
            "UPDATE reservasi SET status = 'rejected' WHERE id_kamar = ? AND id_reservasi <> ? AND status = 'pending'",
            [kamar.id_kamar, id_reservasi]
        );

        return { id_reservasi, status: 'approved', otomatis_ditolak: lain.affectedRows };
    }),

    reject: (id_reservasi) => inTransaction(async (connection) => {
        const reservasi = await lockReservasi(connection, id_reservasi);
        if (reservasi.status !== 'pending') {
            throw new BookingError(`Reservasi berstatus "${reservasi.status}" tidak dapat ditolak`, 409);
        }
        await connection.query(
            "UPDATE reservasi SET status = 'rejected' WHERE id_reservasi = ?", [id_reservasi]
        );
        return { id_reservasi, status: 'rejected' };
    }),

    cancelApproved: (id_reservasi) => inTransaction(async (connection) => {
        // Urutan kunci sama dengan approve(): kamar dulu, baru reservasi (cegah deadlock)
        const [[awal]] = await connection.query(
            'SELECT id_kamar FROM reservasi WHERE id_reservasi = ?', [id_reservasi]
        );
        if (!awal) throw new BookingError('Reservasi tidak ditemukan', 404);

        const [[kamar]] = await connection.query(
            'SELECT id_kamar, status FROM kamar WHERE id_kamar = ? FOR UPDATE', [awal.id_kamar]
        );

        const reservasi = await lockReservasi(connection, id_reservasi);
        if (reservasi.status !== 'approved') {
            throw new BookingError(`Reservasi berstatus "${reservasi.status}" tidak dapat dibatalkan oleh admin`, 409);
        }

        await connection.query(
            "UPDATE reservasi SET status = 'cancelled' WHERE id_reservasi = ?", [id_reservasi]
        );

        // Kamar hanya dikosongkan jika masih 'reserved'. Kalau admin sudah mengubahnya
        // (mis. occupied/maintenance), statusnya dibiarkan.
        const kamarDikosongkan = Boolean(kamar && kamar.status === 'reserved');
        if (kamarDikosongkan) {
            await connection.query(
                "UPDATE kamar SET status = 'empty', updated_at = NOW() WHERE id_kamar = ?", [kamar.id_kamar]
            );
        }

        return { id_reservasi, status: 'cancelled', kamar_dikosongkan: kamarDikosongkan };
    }),

    // Pelanggan hanya boleh membatalkan reservasinya sendiri yang masih pending
    cancel: (id_reservasi, id_user) => inTransaction(async (connection) => {
        const reservasi = await lockReservasi(connection, id_reservasi);
        // 404 (bukan 403) agar tidak membocorkan keberadaan reservasi milik orang lain
        if (reservasi.id_user !== id_user) throw new BookingError('Reservasi tidak ditemukan', 404);
        if (reservasi.status !== 'pending') {
            throw new BookingError('Hanya reservasi yang masih menunggu konfirmasi yang dapat dibatalkan', 409);
        }
        await connection.query(
            "UPDATE reservasi SET status = 'cancelled' WHERE id_reservasi = ?", [id_reservasi]
        );
        return { id_reservasi, status: 'cancelled' };
    }),
};

module.exports = ReservasiModel;