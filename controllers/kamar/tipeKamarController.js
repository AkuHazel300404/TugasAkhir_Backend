const TipeKamarModel = require('../../models/kamar/tipeKamarModel');
const { handleError } = require('../../utils/httpError');

const TipeKamarController = {

    getAll: async (req, res) => {
        try {
            const tipeKamar = await TipeKamarModel.getAll();
            res.status(200).json({data: tipeKamar});
        } catch ( error ) {
            res.status(404).json({message: 'Tipe Kamar Tidak Ditemukan'});
        }
    },

    getById: async (req, res) => {
        try {
            const {id_tipe_kamar} = req.params;
            const tipeKamar = await TipeKamarModel.getById(id_tipe_kamar);
            if(!tipeKamar) {
                res.status(404).json({message: 'Tipe Kamar Tidak Ditemukan'});
            }
            res.status(200).json({data: tipeKamar});
        } catch ( error ) {
            res.status(500).json({message: 'Internal Server Error'});
        }
     },

     create: async (req, res) => {
        try {
            const result = await TipeKamarModel.create(req.body);
            res.status(201).json({data: result, message: 'Tipe Kamar Berhasil Dibuat'});
        } catch ( error ) {
            res.status(500).json({message: 'Internal Server Error'});
        }
     },

     update: async (req, res) => {
        try {

            const {id_tipe_kamar} = req.params;
            const {nama, deskripsi} = req.body;

            if(!nama) {
                return res.status (400).json({message: 'Nama Tipe Kamar Tidak Boleh Kosong'});
            }

            const tipeKamar = await TipeKamarModel.getById(id_tipe_kamar);
            if(!tipeKamar) {
                return res.status(404).json({message: 'Tipe Kamar Tidak Ditemukan'});
            }

            const result = await TipeKamarModel.update(id_tipe_kamar, req.body);
            res.status(200).json({data: result, message: 'Tipe Kamar Berhasil Diupdate'});
        } catch ( error ) { 
            res.status(500).json({message: 'Internal Server Error'});
        }
     },

     delete: async (req, res) => {
        try {
            const {id_tipe_kamar} = req.params;
            const tipeKamar = await TipeKamarModel.getById(id_tipe_kamar);
            if(!tipeKamar) {
                return res.status(404).json({message: 'Tipe Kamar Tidak Ditemukan'});
            }

            const result = await TipeKamarModel.delete(id_tipe_kamar);
            res.status(200).json({data: result, message: 'Tipe Kamar Berhasil Dihapus'});
        } catch ( error ) {
            res.status(500).json({message: 'Internal Server Error'});
        }
     },

};

module.exports = TipeKamarController;