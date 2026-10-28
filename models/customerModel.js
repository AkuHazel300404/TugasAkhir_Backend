const db = require('../config/db');
const {AppError} = require('../utils/httpError');

const CustomerModel = {

    getAll: async (filters = {}) => {
        let query = `
            SELECT
                id_customer, nama, jenis_kelamin, tanggal_lahir, nomor_hp, email,
                alamat, pekerjaan, nomor_ktp, nama_kontak_darurat, hubungan_kontak_darurat, nomor_kontak_darurat,
                catatan, is_blacklist, created_at
            FROM customer
            WHERE 1=1
        `;
        const params = [];

        if (filters.tipe_tamu) {
            query += ' AND tipe_tamu = ?';
            params.push(filters.tipe_tamu);
        }
        if (filters.is_blacklist !== undefined) {
            query += ' AND is_blacklist = ?';
            params.push(filters.is_blacklist);
        }
        if (filters.search) {
            query += ' AND (nama LIKE ? OR nomor_hp LIKE ? OR nomor_ktp LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
        }

        query += ' ORDER BY nama ASC';

        const [rows] = await db.query(query, params);
        return rows;
    },

    getAllData: async (filters = {}) => {
        let query = `
            SELECT
                id_customer, nama, jenis_kelamin, tanggal_lahir, nomor_hp, email,
                alamat, pekerjaan, nomor_ktp, nama_kontak_darurat, hubungan_kontak_darurat, nomor_kontak_darurat,
                catatan, is_blacklist, created_at
            FROM customer
            WHERE 1=1
        `;
        const params = [];

        if (filters.is_blacklist !== undefined && filters.is_blacklist !== '') {
            query += ' AND is_blacklist = ?';
            params.push(filters.is_blacklist);
        }
        if (filters.search) {
            query += ' AND (nama LIKE ? OR nomor_hp LIKE ? OR nomor_ktp LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
        }

        query += ' ORDER BY nama ASC';

        const [rows] = await db.query(query, params);
        return rows;
    },

    getById: async (id_customer) => {
        const [[customer]] = await db.query(
            'SELECT * FROM customer WHERE id_customer = ?',
            [id_customer]
        );
        return customer || null;
    },

    create: async (data) => {
        const {
            nama, jenis_kelamin, tanggal_lahir, 
            nomor_hp, email, alamat, pekerjaan, nomor_ktp, foto_ktp,
            nama_kontak_darurat, hubungan_kontak_darurat, nomor_kontak_darurat,
            tipe_tamu, is_blacklist = 0, catatan
        } = data;

        const [result] = await db.query(`
            INSERT INTO customer (
                nama, jenis_kelamin, tanggal_lahir, 
                nomor_hp, email, alamat, pekerjaan, nomor_ktp, foto_ktp,
                nama_kontak_darurat, hubungan_kontak_darurat, nomor_kontak_darurat,
                tipe_tamu, is_blacklist, catatan
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nama, jenis_kelamin, tanggal_lahir ?? null, pekerjaan ?? null,
                nomor_hp, email ?? null, alamat ?? null, nomor_ktp, foto_ktp ?? null,
                nama_kontak_darurat ?? null, hubungan_kontak_darurat ?? null, nomor_kontak_darurat ?? null,
                tipe_tamu, is_blacklist, catatan ?? null
            ]
        );
        return result;
    },

    update: async (id_customer, data) => {
        const {
            nama, jenis_kelamin, tanggal_lahir, 
            nomor_hp, email, alamat, pekerjaan, nomor_ktp, foto_ktp,
            nama_kontak_darurat, hubungan_kontak_darurat, nomor_kontak_darurat,
            is_blacklist, catatan
        } = data;

        const [result] = await db.query(`
            UPDATE customer SET
                nama = ?, jenis_kelamin = ?, tanggal_lahir = ?, 
                nomor_hp = ?, email = ?, alamat = ?, pekerjaan = ?, nomor_ktp = ?, foto_ktp = ?,
                nama_kontak_darurat = ?, hubungan_kontak_darurat = ?, nomor_kontak_darurat = ?,
                is_blacklist = ?, catatan = ?
            WHERE id_customer = ?`,
            [
                nama, jenis_kelamin, tanggal_lahir ?? null, 
                nomor_hp, email ?? null, alamat ?? null, pekerjaan ?? null, nomor_ktp, foto_ktp ?? null,
                nama_kontak_darurat ?? null, hubungan_kontak_darurat ?? null, nomor_kontak_darurat ?? null,
                is_blacklist ?? 0, catatan ?? null,
                id_customer
            ]
        );
        return result;
    },

    blacklist: async (id_customer) => {
        const [[customer]] = await db.query(
            'SELECT is_blacklist FROM customer WHERE id_customer = ?', [id_customer]
        );

        if (!customer) throw new AppError('Customer tidak ditemukan.', 404);
        if (customer.is_blacklist) throw new AppError('Customer sudah ada di blacklist.');

        const [result] = await db.query(
            'UPDATE customer SET is_blacklist = 1 WHERE id_customer = ?', [id_customer]
        );
        return result;
    },

    whitelist: async (id_customer) => {
        const [[customer]] = await db.query(
            'SELECT is_blacklist FROM customer WHERE id_customer = ?', [id_customer]
        );

        if (!customer) throw new AppError('Customer tidak ditemukan.', 404);
        if (!customer.is_blacklist) throw new AppError('Customer tidak ada di blacklist.');

        const [result] = await db.query(
            'UPDATE customer SET is_blacklist = 0 WHERE id_customer = ?', [id_customer]
        );
        return result;
    },

    delete: async (id_customer) => {
        const [[customer]] = await db.query(
            'SELECT id_customer FROM customer WHERE id_customer = ?', [id_customer]
        );

        if (!customer) throw new AppError('Customer tidak ditemukan.', 404);

        const [result] = await db.query(
            'DELETE FROM customer WHERE id_customer = ?', [id_customer]
        );
        return result;
    },

    deactivate: async (id_customer) => {
        const [[customer]] = await db.query(
            'SELECT id_customer FROM customer WHERE id_customer = ?', [id_customer]
        );

        if (!customer) throw new AppError('Customer tidak ditemukan.', 404);

        const [result] = await db.query(
            'UPDATE customer SET is_active = 0 WHERE id_customer = ?', [id_customer]
        );
        return result;
    },

};

module.exports = CustomerModel;