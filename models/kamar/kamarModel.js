const db = require('../../config/db');
const {AppError} = require('../../utils/httpError');
const { withTransaction } = require('../../utils/transaction');

const BOOKABLE_STATUS = ['empty'];

const KamarModel = {

    getAll: async (filters = {} ) => {
        try {

        
        let query = `
            SELECT 
                k.id_kamar, k.nomor_kamar, k.id_tipe_kamar,  k.kapasitas, k.luas_kamar, 
                k.harga_per_malam, k.harga_per_bulan, k.jumlah_deposit, 
                k.status, k.is_active, k.deskripsi, k.notes,
                t.nama AS tipe_kamar, 
                
                GROUP_CONCAT(DISTINCT f.path SEPARATOR '|') as foto_kamar,

                GROUP_CONCAT(DISTINCT CONCAT(fk.id_fasilitas, ':', fk.nama, ':', fk.icon) SEPARATOR '|') as data_fasilitas

            FROM kamar k
            LEFT JOIN tipe_kamar t ON k.id_tipe_kamar = t.id_tipe_kamar
            LEFT JOIN foto_kamar f ON k.id_kamar = f.id_kamar
            LEFT JOIN kamar_fasilitas_kamar as kfk ON k.id_kamar = kfk.id_kamar
            LEFT JOIN fasilitas_kamar as fk ON kfk.id_fasilitas = fk.id_fasilitas
            WHERE 1=1`;

        const params = [];

        if(filters.search) {
            query += ` AND (
                k.nomor_kamar LIKE ? OR 
                t.nama LIKE ? OR 
                EXISTS (
                    SELECT 1 
                    FROM kamar_fasilitas_kamar kfk_sub
                    JOIN fasilitas_kamar fk_sub ON kfk_sub.id_fasilitas = fk_sub.id_fasilitas
                    WHERE kfk_sub.id_kamar = k.id_kamar 
                    AND fk_sub.nama LIKE ?
                )
            )`;

            params.push(`%${filters.search}%`);
            params.push(`%${filters.search}%`);
            params.push(`%${filters.search}%`);
        }
        if (filters.status) {
            query += ' AND k.status = ? ';
            params.push(filters.status);
        }
        if (filters.is_active !== undefined) {
            query += ' AND k.is_active = ? ';
            params.push(filters.is_active);
        }

        query += ' GROUP BY k.id_kamar ORDER BY k.nomor_kamar ASC';

        const [rows] = await db.query(query, params);

        const formattedData = rows.map(room => {
            let listFasilitas = [];
            let listFoto = [];

            if(room.foto_kamar) {
                const perFoto = room.foto_kamar.split('|');
                listFoto = perFoto.map(pathRaw => {
                    return {path: pathRaw};
                });
            }

            if (room.data_fasilitas) {
                const perFasilitas = room.data_fasilitas.split('|');
                listFasilitas = perFasilitas.map(item => {
                    const [id_fasilitas, nama, icon] = item.split(':');
                    return { 
                        id_fasilitas: Number(id_fasilitas), 
                        nama: nama, 
                        icon: icon 
                    };
                });
            }

            // Hapus properti data_fasilitas yang berwujud string mentah agar rapi
            delete room.foto_kamar;
            delete room.data_fasilitas; 

            return {
                ...room,
                fasilitas: listFasilitas, // Hierarki disisipkan ke sini
                foto: listFoto
            };
        });

        return formattedData;
        } catch ( error ) {
            console.error('KamarModel getAll error:', error);
            throw error;
        } 
    },

    getById: async (id_kamar) => {
        try {
            const [[kamar]] = await db.query(`
            SELECT k.*,
                t.nama AS tipe_kamar
            FROM kamar k
            LEFT JOIN tipe_kamar t ON k.id_tipe_kamar = t.id_tipe_kamar
            WHERE k.id_kamar = ?`, [id_kamar]);

            if (!kamar) return null;

            // 2. Ambil Fasilitas Kamar (PERBAIKAN: ON kf.id_fasilitas_kamar & SERTAKAN icon)
            const [fasilitas] = await db.query(`
                SELECT f.id_fasilitas, f.nama, f.icon
                FROM fasilitas_kamar f
                INNER JOIN kamar_fasilitas_kamar kf ON f.id_fasilitas = kf.id_fasilitas
                WHERE kf.id_kamar = ?`, [id_kamar]);

            // 3. Ambil Foto Kamar
            const [foto] = await db.query(`
                SELECT id_foto_kamar, path, sort_order, is_primary
                FROM foto_kamar
                WHERE id_kamar = ?
                ORDER BY is_primary DESC, sort_order ASC`, [id_kamar]);

            return {
                ...kamar,
                fasilitas,
                foto
            };
        } catch (error) {
            console.error('Get Kamar by Id error : ', error);
            throw error
        }
        // 1. Ambil Data Kamar & Tipe
        
    },


    get:async () => {
        const [rows] = await db.query('SELECT * FROM kamar');
        return rows;
    },


    create: async(data) => {
        const connection = await db.getConnection();

        try{
            await connection.beginTransaction();

            const {
            nomor_kamar, id_tipe_kamar, kapasitas, luas_kamar,
            harga_per_malam, harga_per_bulan, jumlah_deposit, 
            status = 'empty', is_active = 1, deskripsi, notes, 
            fasilitas
            } = data;

            const [result] = await connection.query (`
                INSERT INTO kamar (
                    nomor_kamar, id_tipe_kamar, kapasitas, luas_kamar,
                    harga_per_malam, harga_per_bulan, jumlah_deposit,
                    status, is_active, deskripsi, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [
                nomor_kamar, id_tipe_kamar, kapasitas, luas_kamar ?? null,
                harga_per_malam ?? null, harga_per_bulan ?? null, jumlah_deposit ?? null,
                status, is_active, deskripsi ?? null, notes ?? null, 
            ]);

            const newKamarId = result.insertId;

            if (fasilitas && fasilitas.length > 0) {
                const junctionValues = fasilitas.map(id_fasilitas => [newKamarId, id_fasilitas]);

                // Sesuaikan nama tabel junction sesuai ERD kamu
                const queryJunction = `INSERT INTO kamar_fasilitas_kamar (id_kamar, id_fasilitas) VALUES ?`;
                
                await connection.query(queryJunction, [junctionValues]);
            }

            await connection.commit();

            return result;
        } catch (error) {
            await connection.rollback();
            console.error('KamarModel create error:', error);
            throw error;
        }finally{
            connection.release();
        }
        
    },


    update: async (id_kamar, data) => {
        const connection = await db.getConnection();
        try{

            await connection.beginTransaction();
        
            const {
                nomor_kamar, id_tipe_kamar, kapasitas, luas_kamar,
                harga_per_malam, harga_per_bulan, jumlah_deposit,
                status, is_active, deskripsi, notes,
                fasilitas
            } = data;

            const [result] = await connection.query(
                `UPDATE kamar SET
                    nomor_kamar = ?, id_tipe_kamar = ?, kapasitas = ?, luas_kamar =?,
                    harga_per_malam = ?, harga_per_bulan = ?, jumlah_deposit = ?, 
                    status = ?, is_active = ?, deskripsi = ?, notes = ?, updated_at = NOW()
                WHERE id_kamar = ?`,
                [
                    nomor_kamar, id_tipe_kamar, kapasitas, luas_kamar,
                    harga_per_malam ?? null, harga_per_bulan ?? null, jumlah_deposit ?? null,
                    status, is_active, deskripsi ?? null, notes ?? null, id_kamar
                ]);

                await connection.query('DELETE FROM kamar_fasilitas_kamar WHERE id_kamar = ?', [id_kamar])
                
                if (fasilitas && fasilitas.length > 0) {
                    const junctionValues = fasilitas.map(id_fasilitas => [id_kamar, id_fasilitas]);
                    const queryJunction = `INSERT INTO kamar_fasilitas_kamar (id_kamar, id_fasilitas) VALUES ?`;

                    await connection.query(queryJunction, [junctionValues]);
                }

                await connection.commit();
                return result;
        } catch (error) {
            await connection.rollback();
            console.error('KamarModel update error:', error);
            throw error;
        } finally {
            connection.release();
        }
    },


    updateStatus: async (id_kamar, status) => {
        const VALID_STATUS = ['reserved', 'occupied', 'empty', 'cleaning', 'maintenance'];
        if (!VALID_STATUS.includes(status)) throw new AppError(`Status tidak valid: ${status}`);

        return withTransaction(async (connection) => {
            // Kunci baris kamar lebih dulu (urutan kunci sama dengan reservasiModel: kamar dulu)
            const [[kamar]] = await connection.query(
                'SELECT id_kamar FROM kamar WHERE id_kamar = ? FOR UPDATE', [id_kamar]
            );
            if (!kamar) throw new AppError('Kamar tidak ditemukan.', 404);

            // Kamar yang punya reservasi disetujui tidak boleh ditandai kosong secara manual,
            // karena statusnya akan bertentangan dengan reservasi yang masih berlaku.
            if (BOOKABLE_STATUS.includes(status)) {
                const [[disetujui]] = await connection.query(
                    "SELECT id_reservasi FROM reservasi WHERE id_kamar = ? AND status = 'approved' LIMIT 1",
                    [id_kamar]
                );
                if (disetujui) {
                    throw new AppError(
                        'Kamar ini masih memiliki reservasi yang disetujui. Batalkan reservasi tersebut terlebih dahulu.',
                        409
                    );
                }
            }

            const [result] = await connection.query(
                'UPDATE kamar SET status = ?, updated_at = NOW() WHERE id_kamar = ?',
                [status, id_kamar]
            );
            return result;
        });
    },

    activate: async (id_kamar) => {
        const result = await db.query(
            'UPDATE kamar SET is_active = 1 WHERE id_kamar = ?',
            [id_kamar]
        );
        return result;
    },


    deactivate: async (id_kamar) => {
        const [[kamar]] = await db.query('SELECT * FROM kamar WHERE id_kamar = ?', [id_kamar]);
        if (!kamar) {
            throw new AppError('Kamar Tidak Ditemukan', 404);
        }

        const BLOCKED_STATUS = ['reserved', 'occupied'];

        if(BLOCKED_STATUS.includes(kamar.status)) {
            throw new AppError(`Kamar Tidak Dapat Dinonaktifkan dengan Status "${kamar.status}"`);
        }

        const result = await db.query(
            'UPDATE kamar SET is_active = 0 WHERE id_kamar = ?',
            [id_kamar]
        );
        return result;
    },
    
    delete: async (id_kamar) => withTransaction(async (connection) => {
        const [[kamar]] = await connection.query(
            'SELECT id_kamar, status FROM kamar WHERE id_kamar = ? FOR UPDATE', [id_kamar]
        );
        if (!kamar) throw new AppError('Kamar tidak ditemukan.', 404);

        const BLOCKED_STATUS = ['reserved', 'occupied', 'maintenance', 'cleaning'];
        if (BLOCKED_STATUS.includes(kamar.status)) {
            throw new AppError(`Kamar tidak dapat dihapus dengan status "${kamar.status}"`, 409);
        }

        // Kamar yang pernah punya reservasi tidak dihapus supaya riwayatnya tetap utuh.
        const [[riwayat]] = await connection.query(
            'SELECT id_reservasi FROM reservasi WHERE id_kamar = ? LIMIT 1', [id_kamar]
        );
        if (riwayat) {
            throw new AppError('Kamar ini memiliki riwayat reservasi dan tidak dapat dihapus. Nonaktifkan kamar sebagai gantinya.', 409);
        }

        const [foto] = await connection.query('SELECT path FROM foto_kamar WHERE id_kamar = ?', [id_kamar]);

        // Hapus data turunan dulu, baru kamarnya
        await connection.query('DELETE FROM kamar_fasilitas_kamar WHERE id_kamar = ?', [id_kamar]);
        await connection.query('DELETE FROM foto_kamar WHERE id_kamar = ?', [id_kamar]);
        const [result] = await connection.query('DELETE FROM kamar WHERE id_kamar = ?', [id_kamar]);

        // path foto dikembalikan agar file di disk bisa dibersihkan oleh controller
        return { affectedRows: result.affectedRows, foto: foto.map((f) => f.path) };
    }),
};

module.exports = KamarModel;