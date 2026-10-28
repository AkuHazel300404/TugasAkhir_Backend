const db = require('../config/db');
const { hashPassword } = require('../utils/bcrypt');
const {AppError} = require('../utils/httpError');

const PROFILE_FIELDS = [
    'nama', 'jenis_kelamin', 'tanggal_lahir', 'nomor_hp', 'alamat',
    'nama_kontak_darurat', 'hubungan_kontak_darurat', 'nomor_kontak_darurat',
];

const UserModel = {

    getAll: async (filters = {}) => {
        let query = `
            SELECT
                id_user, nama, jenis_kelamin, tanggal_lahir, nomor_hp, email,
                alamat, nama_kontak_darurat, hubungan_kontak_darurat, nomor_kontak_darurat,
                catatan, created_at
            FROM user
            WHERE 1=1
        `;
        const params = [];

        // if (filters.tipe_tamu) {
        //     query += ' AND tipe_tamu = ?';
        //     params.push(filters.tipe_tamu);
        // }
        // if (filters.is_blacklist !== undefined) {
        //     query += ' AND is_blacklist = ?';
        //     params.push(filters.is_blacklist);
        // }
        if (filters.search) {
            query += ' AND (nama LIKE ? OR nomor_hp LIKE ? )';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        query += ' ORDER BY nama ASC';

        const [rows] = await db.query(query, params);
        return rows;
    },

    getAllData: async (filters = {}) => {
        let query = `
            SELECT
                id_user, nama, jenis_kelamin, tanggal_lahir, nomor_hp, email,
                alamat, nama_kontak_darurat, hubungan_kontak_darurat, nomor_kontak_darurat,
                catatan, created_at
            FROM user
            WHERE 1=1
        `;
        const params = [];

        if (filters.is_blacklist !== undefined && filters.is_blacklist !== '') {
            query += ' AND is_blacklist = ?';
            params.push(filters.is_blacklist);
        }
        if (filters.search) {
            query += ' AND (nama LIKE ? OR nomor_hp LIKE ? )';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        query += ' ORDER BY nama ASC';

        const [rows] = await db.query(query, params);
        return rows;
    },

    getById: async (id_user) => {
        const [[user]] = await db.query(
            `SELECT id_user, nama, jenis_kelamin, tanggal_lahir, nomor_hp, email, alamat,
                    nama_kontak_darurat, hubungan_kontak_darurat, nomor_kontak_darurat
             FROM user WHERE id_user = ?`,
            [id_user]
        );
        return user || null;
    },

    getByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM user WHERE email= ? ' , [email]);
        return rows [0];
    },

    updateProfile: async (id_user, data) => {
        const sets = [];
        const params = [];

        for (const field of PROFILE_FIELDS) {
            if (data[field] !== undefined) {
                sets.push(`${field} = ?`);
                params.push(data[field] === '' ? null : data[field]);
            }
        }

        if (sets.length === 0) return { affectedRows: 0 };

        params.push(id_user);
        const [result] = await db.query(
            `UPDATE user SET ${sets.join(', ')} WHERE id_user = ?`,
            params
        );
        return result;
    },

    // Khusus pemakaian internal server. Jangan pernah mengirim hasilnya ke client.
    getPasswordHash: async (id_user) => {
        const [[row]] = await db.query(
            'SELECT password FROM user WHERE id_user = ?', [id_user]
        );
        return row?.password || null;
    },

    getAuthState: async (id_user) => {
        const [[row]] = await db.query(
            'SELECT id_user, is_active, is_blacklist, token_version FROM user WHERE id_user = ?',
            [id_user]
        );
        return row || null;
    },

    updatePassword: async (id_user, newPassword) => {
        const hashed = await hashPassword(newPassword);
        const [result] = await db.query(
            'UPDATE user SET password = ?, token_version = token_version + 1 WHERE id_user = ?', [hashed, id_user]
        );
        return result;
    },

    create: async (data) => {
        const {
            nama, jenis_kelamin, tanggal_lahir, 
            nomor_hp, email, password, alamat,
            nama_kontak_darurat, hubungan_kontak_darurat, nomor_kontak_darurat,
            is_blacklist = 0, catatan
        } = data;
        
        const hashedPassword = await hashPassword(password);

        const [result] = await db.query(`
            INSERT INTO user (
                nama, jenis_kelamin, tanggal_lahir, 
                nomor_hp, email, password,alamat,
                nama_kontak_darurat, hubungan_kontak_darurat, nomor_kontak_darurat,
                is_blacklist, catatan
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nama, jenis_kelamin ?? null, tanggal_lahir ?? null,
                nomor_hp ?? null, email ?? null, hashedPassword, alamat ?? null,
                nama_kontak_darurat ?? null, hubungan_kontak_darurat ?? null, nomor_kontak_darurat ?? null,
                is_blacklist, catatan ?? null
            ]
        );
        return result;
    },

    update: async (id_user, data) => {
        const {
            nama, jenis_kelamin, tanggal_lahir, 
            nomor_hp, email, alamat, 
            nama_kontak_darurat, hubungan_kontak_darurat, nomor_kontak_darurat,
            is_blacklist, catatan
        } = data;


        const [result] = await db.query(`
            UPDATE user SET
                nama = ?, jenis_kelamin = ?, tanggal_lahir = ?, 
                nomor_hp = ?, email = ?, alamat = ?,
                nama_kontak_darurat = ?, hubungan_kontak_darurat = ?, nomor_kontak_darurat = ?,
                is_blacklist = ?, catatan = ?
            WHERE id_user = ?`,
            [
                nama, jenis_kelamin, tanggal_lahir ?? null,
                nomor_hp, email ?? null, alamat ?? null,
                nama_kontak_darurat ?? null, hubungan_kontak_darurat ?? null, nomor_kontak_darurat ?? null,
                is_blacklist, catatan ?? null,
                id_user
            ]
        );
        return result;
    },

    updateProfile: async (id_user, data) => {
        const sets = [];
        const params = [];

        for (const field of PROFILE_FIELDS) {
            if (data[field] !== undefined) {
                sets.push(`${field} = ?`);
                params.push(data[field] === '' ? null : data[field]);
            }
        }

        if (sets.length === 0) return { affectedRows: 0 };

        params.push(id_user);
        const [result] = await db.query(
            `UPDATE user SET ${sets.join(', ')} WHERE id_user = ?`,
            params
        );
        return result;
    },
        
    blacklist: async (id_user) => {
        const [[user]] = await db.query(
            'SELECT is_blacklist FROM user WHERE id_user = ?', [id_user]
        );

        if (!user) throw new AppError('User tidak ditemukan.', 404);
        if (user.is_blacklist) throw new AppError('User sudah ada di blacklist.');

        const [result] = await db.query(
            'UPDATE user SET is_blacklist = 1 WHERE id_user = ?', [id_user]
        );
        return result;
    },

    whitelist: async (id_user) => {
        const [[user]] = await db.query(
            'SELECT is_blacklist FROM user WHERE id_user = ?', [id_user]
        );

        if (!user) throw new AppError('User tidak ditemukan.', 404);
        if (!user.is_blacklist) throw new AppError('User tidak ada di blacklist.');

        const [result] = await db.query(
            'UPDATE user SET is_blacklist = 0 WHERE id_user = ?', [id_user]
        );
        return result;
    },

    delete: async (id_user) => {
        const [[user]] = await db.query(
            'SELECT id_user FROM user WHERE id_user = ?', [id_user]
        );

        if (!user) throw new AppError('User tidak ditemukan.', 404);

        const [result] = await db.query(
            'DELETE FROM user WHERE id_user = ?', [id_user]
        );
        return result;
    },

    deactivate: async (id_user) => {
        const [[user]] = await db.query(
            'SELECT id_user FROM user WHERE id_user = ?', [id_user]
        );

        if (!user) throw new AppError('User tidak ditemukan.', 404);

        const [result] = await db.query(
            'UPDATE user SET is_active = 0 WHERE id_user = ?', [id_user]
        );
        return result;
    },

};

module.exports = UserModel;