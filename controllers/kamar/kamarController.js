const KamarModel = require('../../models/kamar/kamarModel');

const KamarController = {

    getAll: async (req, res) => {
        try {
            const {status, is_active, search} = req.query;
            const kamar = await KamarModel.getAll(req.query);
            if(!kamar) {
                res.status(404).json({message: 'Kamar Tidak Ditemukan'});
            }
            res.status(200).json({data: kamar, total: kamar.length});
        } catch (error) {
            console.error('Kamar getAll error:', error);
            res.status(500).json({message: 'Dia Lari Ke Sini'});
        }
    },

    getById: async (req, res) => {
        try {
            const {id_kamar} = req.params;
            const kamar = await KamarModel.getById(id_kamar);
            if(!kamar) {
                res.status(404).json({message: 'Kamar Tidak Ditemukan'});
            }
            res.status(200).json({data: kamar});
        } catch (error) {
            res.status(500).json({message: 'Internal Server Error'});
        }
    },

    create: async (req, res) => {
        try {
            const result = await KamarModel.create(req.body);
            res.status(201).json({data: result, message: 'Kamar berhasil dibuat'});
        } catch ( error ){
            res.status(500).json({message: 'Internal server error'});
        }
    },

    update: async (req, res) => {
        try {
            const {id_kamar} = req.params;
            const result = await KamarModel.update(id_kamar, req.body);
            res.status(200).json({data: result, message: 'Room updated successfully'});

        } catch ( error ) {
            res.status(500).json({message: 'Internal server error'});
        }
    },

    updateStatus: async (req, res) => {
        try {
            const {id_kamar} = req.params;
            const result = await KamarModel.updateStatus(id_kamar, req.body.status);
            res.status(200).json({data:result, message: 'Status Kamar Berhasil Diubah'});
        } catch ( error ) {
            res.status(500).json({message: 'Internal Server Error'});
        }
    },

    activate: async (req, res) => {
        try {
            const {id_kamar} = req.params;
            const result = await KamarModel.activate(id_kamar);
            res.status(200).json({data: result, message: 'Kamar Berhasil Diaktifkan'});
        } catch ( error ) {
            res.status(400).json({message: error.message});
        }
    },

    deactivate: async (req, res) => {
        try {
            const {id_kamar} = req.params;
            const result = await KamarModel.deactivate(id_kamar);
            res.status(200).json({data: result, message: 'Kamar Berhasil Dinonaktifkan'});
        } catch ( error ) {
            res.status(400).json({message: error.message});
        }
    },

    delete: async (req, res) => {
        try {
            const {id_kamar} = req.params;
            const result = await KamarModel.delete(id_kamar);
            res.status(200).json({data: result, message: 'Kamar Berhasil Dihapus'});
        } catch ( error) {
            res.status(400).json({message: error.message});
        }
    },
};

module.exports = KamarController;