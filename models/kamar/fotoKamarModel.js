const db = require('../../config/db'); 

const FotoKamarModel = {

    getByKamar: async(id_kamar) => {
        const [rows] = await db.query(`
            SELECT id, path, sort_order, is_primary
            FROM foto_kamar
            WHERE id_kamar = ?
            ORDER BY is_primary DESC, sort_order ASC
        `, [id_kamar]);
        return rows;
    },

    getById: async (id_foto) => {
        const [[foto]] = await db.query('SELECT * FROM foto_kamar WHERE id_foto = ? ', [id_foto]);
        return foto || null;
    },

    create: async ({id_kamar, path, sort_order = 0, is_primary = 0}) => {
        const [[{ total }]] = await db.query(`
            SELECT COUNT(*) AS total FROM foto_kamar WHERE id_kamar = ?`,
            [id_kamar]
        );
        const jadikanPrimary = total === 0 ? 1 : is_primary;

        if (jadikanPrimary) {
            await db.query(
                'UPDATE foto_kamar SET is_primary = 0 WHERE id_kamar =?',
                [id_kamar]
            );               
        }

        const [result] = await db.query(
            'INSERT INTO foto_kamar (id_kamar, path, sort_order, is_primary) VALUES (?, ?, ?, ?)',
            [id_kamar, path, sort_order, jadikanPrimary]
        );
        return result;
    },

    setPrimary: async (id_foto, id_kamar) => {
        await db.query(
            'UPDATE foto_kamar SET is_primary = 0 WHERE id_kamar = ?', [id_kamar]
        );

        const [result] = await db.query(
            'UPDATE foto_kamar SET is_primary = 1 WHERE id_foto = ?', [id_foto]
        );
        return result;
    },

    delete: async (id_foto) => {
        const [[foto]] = await db.query('SELECT * FROM foto_kamar WHERE id_foto = ?', [id_foto]);
        if (!foto) return null;

        await db.query('DELETE FROM foto_kamar WHERE id_foto = ?', [id_foto]);

        if (foto.is_primary) {
            await db.query(`
                UPDATE foto_kamar SET is_primary = 1
                WHERE id_kamar = ?
                ORDER BY sort_order ASC
                LIMIT 1
            `, [foto.id_kamar]);
        }

        return foto;
    },    
};