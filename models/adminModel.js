const db = require('../config/db');
const { hashPasswword } = require('../utils/bcrypt');

const AdminModel = {


    //Get all
    getAll:async () => {
        const [rows] = await db.query('SELECT * FROM admin');
        return rows;
    },

    getAllAktif: async () => {
        const [rows] = await db.query ( 'SELECT * FROM admin WHERE status = 1');
        return [rows];
    },

    //Get by id
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM admin WHERE id = ?', [id]);
        return rows[0];
    },

    //Get by id admin aktif
    getByIdAktif: async (id) => {
        const [rows] = await db.query ( 'SELECT * FROM admin WHERE id = ? AND status = 1', [id] );
        return rows[0];
    },

    getByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM admin WHERE email= ? ' , [email]);
        return rows [0];
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
    deaktivasiAdmin: async (id) => {
        const result = await db.query('UPDATE admin SET status = 0 WHERE id = ?', [id]);
        return result;
    },

    //Aktivasi admin 
    aktivasiAdmin: async (id) => {
        const result = await db.query('UPDATE admin SET status = 1 WHERE id = ?', [id]);
        return result;
    }
}; 


module.exports = AdminModel;