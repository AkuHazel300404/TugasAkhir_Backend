const db = require('../../config/db');
const {AppError} = require('../../utils/httpError');

const FasilitasKamarModel = {

    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM fasilitas_kamar ORDER BY nama ASC');
        return rows;
    },

    getById: async (id_fasilitas_kamar) => {
        const [[row]] = await db.query('SELECT * FROM fasilitas_kamar WHERE id_fasilitas_kamar = ?', [id_fasilitas_kamar]);
        return row;
    },

    getByKamar: async (id_kamar) => {
        try {
            const [rows] = await db.query(`
                SELECT fk.id_fasilitas, fk.nama, fk.icon
                FROM fasilitas_kamar fk
                JOIN kamar_fasilitas_kamar kfk ON fk.id_fasilitas = kfk.id_fasilitas
                WHERE kfk.id_kamar = ?
            `, [id_kamar]);
            return rows;
        } catch (error) {
            console.error('KamarModel getAll error:', error);
            throw error;
        }
        
    },

    syncFasilitas: async (id_kamar, id_fasilitas_list = []) => {
        await db.query ('DELETE FROM kamar_fasilitas_kamar WHERE id)kamar = ? ', [id_kamar]);

        if (id_fasilitas_list.length === 0) return;

        const values = id_fasilitas_list.map(id_fasilitas => [id_kamar, id_fasilitas]);
        await db.query(
            'INSERT INTO kamar_fasilitas_kamar (id_kamar, id_fasilitas_kamar) VALUES ?', 
            [values]
        );
    },

    create: async (data) => {
        const { nama, deskripsi } = data;
        const [result] = await db.query(
            'INSERT INTO fasilitas_kamar (nama, deskripsi) VALUES (?, ?)', 
            [nama, deskripsi]
        );
        return result;
    },

    delete: async (id_fasilitas_kamar) => {
        await db.query(`DELETE FROM kamar_fasilitas_kamar WHERE id_fasilitas_kamar = ?`, [id_fasilitas_kamar]);
        const [result] = await db.query(
            'DELETE FROM fasilitas_kamar WHERE id_fasilitas_kamar = ?',
            [id_fasilitas_kamar]
        );
        return result;
    },

};

module.exports = FasilitasKamarModel;