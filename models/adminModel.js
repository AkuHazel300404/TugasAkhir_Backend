const db = require('../config/db');
const { hashPassword } = require('../utils/bcrypt');
const {AppError} = require('../utils/httpError');
const {withTransaction} = require('../utils/transaction');

const AdminModel = {


    //Get all
    getAll:async () => {
        const [rows] = await db.query('SELECT id, nama, email, status FROM admin');
        return rows;
    },

    getAllAktif: async () => {
        const [rows] = await db.query ( 'SELECT id, nama, email, status FROM admin WHERE status = 1');
        return rows;
    },

    //Get by id
    getById: async (id) => {
        const [rows] = await db.query('SELECT id, nama, email, status FROM admin WHERE id = ?', [id]);
        return rows[0];
    },

    //Get by id admin aktif
    getByIdAktif: async (id) => {
        const [rows] = await db.query ( 'SELECT id, nama, email, status FROM admin WHERE id = ? AND status = 1', [id] );
        return rows[0];
    },

    getByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM admin WHERE email= ? ' , [email]);
        return rows [0];
    },

    getAuthState: async (id) => {
        const [rows] = await db.query(
            'SELECT id, status, token_version FROM admin WHERE id = ?', [id]
        );
        return rows[0] || null;
    },

    //Create
    create: async (data) => {
        const { nama, email, password } = data;
        const hashedPassword = await hashPassword(password);
        const [result] = await db.query(
            'INSERT INTO admin (nama, email, password) VALUES (?, ?, ?)',
            [nama, email, hashedPassword]
        );
        return result;
    },

    update: async (id, data) => {
        const {nama, email} = data;
        const result = await db.query ( 
            'UPDATE admin SET nama = ?, email = ? WHERE id = ?', 
            [nama, email, id] );
        return result;
    },

    //Deaktif admin (delete logic)
    deaktivasiAdmin: async (id, actorId) => withTransaction(async (connection) => {
        id = Number(id);
        actorId = Number(actorId);

        if (id === actorId) throw new AppError('Anda tidak dapat menonaktifkan akun Anda sendiri.', 403);

        // Kunci kedua baris (urut id, mencegah deadlock) supaya dua admin yang saling
        // menonaktifkan secara bersamaan tidak bisa membuat jumlah admin aktif menjadi nol.
        const [rows] = await connection.query(
            'SELECT id, status FROM admin WHERE id IN (?, ?) ORDER BY id FOR UPDATE', [id, actorId]
        );
        const target = rows.find((r) => r.id === id);
        const actor = rows.find((r) => r.id === actorId);

        if (!target) throw new AppError('Admin tidak ditemukan.', 404);
        if (!actor || Number(actor.status) !== 1) throw new AppError('Akun Anda tidak aktif.', 403);
        if (Number(target.status) !== 1) throw new AppError('Admin tersebut sudah nonaktif.', 409);

        const [result] = await connection.query('UPDATE admin SET status = 0 WHERE id = ?', [id]);
        return result;
    }),

    //Aktivasi admin 
    aktivasiAdmin: async (id) => {
        const result = await db.query('UPDATE admin SET status = 1 WHERE id = ?', [id]);
        return result;
    }
}; 


module.exports = AdminModel;