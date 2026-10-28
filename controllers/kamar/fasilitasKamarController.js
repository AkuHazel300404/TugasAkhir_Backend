const FasilitasKamarModel = require ('../../models/kamar/fasilitasKamarModel');
const KamarModel = require('../../models/kamar/kamarModel');
const { handleError } = require('../../utils/httpError');

const FasilitasKamarController = {

    getAll: async (req, res) => {
        try {
            const fasilitas = await FasilitasKamarModel.getAll();
            res.status(200).json({data: fasilitas});
        } catch ( error ) {
            res.status(404).json({message: 'Fasilitas Kamar Tidak Ditemukan'});
        }
    },

    getById: async (req, res) => {
        try {
            const {id_fasilitas_kamar} = req.params;
            const fasilitas = await FasilitasKamarModel.getById(id_fasilitas_kamar);
            if(!fasilitas) {
                res.status(404).json({message: 'Fasilitas Kamar Tidak Ditemukan'});
            }
        } catch (error) {
            res.status(500).json({message: 'Internal Server Error'});
        }
    },

    getByKamar: async (req, res) => {
        try {
            const {id_kamar} = req.params;
            const fasilitas = await FasilitasKamarModel.getByKamar(id_kamar);
            res.status(200).json({data: fasilitas});
        } catch ( error ) {
            res.status(404).json({message: 'Fasilitas Kamar Tidak Ditemukan'});
        }
    }, 

    syncFasilitas: async (req, res) => {
        try {
            const { id_kamar } = req.params;
            const { fasilitas } = req.body;

            if(!Array.isArray(fasilitas)) {
                return res.status(400).json({message: 'Fasilitas harus berupa array'});
            }

            const kamar = await KamarModel.getById(id_kamar);
            if(!kamar) {
                return res.status(404).json({message: 'Kamar Tidak Ditemukan'});
            }

            await FasilitasKamarModel.syncFasilitas(id_kamar, fasilitas);
            res.status(200).json({message: 'Fasilitas Kamar berhasil disinkronkan'});
        } catch ( error ) {
            res.status(500).json({message: 'Internal server error'});
        }
    },

    create: async (req, res) => {
        try {
            const result = await FasilitasKamarModel.create(req.body);
            res.status(201).json({data: result, message: 'Fasilitas Kamar berhasil dibuat'});
        } catch ( error ) {
            res.status(500).json({message: 'Internal server error'});
        }
    },

    delete: async (req, res) => {
        try {
            const result = await FasilitasKamarModel.delete(req.params.id);
            res.status(200).json({data: result, message: 'Fasilitas Kamar berhasil dihapus'});
        } catch ( error ) {
            res.status(500).json({message: 'Internal server error'});
        }
    },
};

module.exports = FasilitasKamarController;