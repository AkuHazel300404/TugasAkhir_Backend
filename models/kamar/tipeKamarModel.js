const db = require('../../config/db');

const TipeKamarModel = {

    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM tipe_kamar');
        return rows;
    },

    getById: async (id_tipe_kamar) => {
        const [[row]] = await db.query('SELECT * FROM tipe_kamar WHERE id_tipe_kamar = ?', [id_tipe_kamar]);
        return row;
    },

    create: async (data) => {
        const {nama, deskripsi} = data;
        const [result] = await db.query(
            'INSERT INTO tipe_kamar (nama, deskripsi) VALUES (?, ?)',
            [nama, deskripsi]
        );
        return result;
    },

    update: async (id_tipe_kamar, data) => {
        const {nama, deskripsi} = data;
        const [result] = await db.query(
            'UPDATE tipe_kamar SET nama = ?, deskripsi = ? WHERE id_tipe_kamar = ?',
            [nama, deskripsi, id_tipe_kamar]
        );
        return result;
    },

    delete: async (id_tipe_kamar) => {
        const [[ { total }]] = await db.query( 
            'SELECT COUNT(*) AS total FROM kamar WHERE id_tipe_kamar = ?', [id_tipe_kamar]
        );
        if (total > 0) {
            throw new Error('Tipe kamar masih digunakan oleh kamar aktif.');
        }
        const [result] = await db.query(
            'DELETE FROM tipe_kamar WHERE id_tipe_kamar = ?',
            [id_tipe_kamar]
        );
        return result;
    },
};

module.exports = TipeKamarModel;