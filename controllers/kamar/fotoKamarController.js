const FotoKamarModel = require('../../models/kamar/fotoKamarModel');
const KamarModel = require('../../models/kamar/kamarModel');

const FotoKamarController = {

    getByKamar: async (req, res) => {
        try {
            const {id_kamar} = req.params;
            const kamar = await KamarModel.getById(id_kamar);
            if(!kamar) {
                return res.status(404).json({message: 'Kamar Tidak Ditemukan'});
            }

            const fotoKamar = await FotoKamarModel.getByKamar(id);
            res.status(200).json({
                data: fotoKamar,
                total: fotoKamar.length
            });
        } catch ( error ) {
            console.error('FotoKamar getByKamar error:', error);
            res.status(500).json({message: 'Internal Server Error'});
        }
    },

    getById: async (req, res) => {
        try{
            const {id_foto} = req.params;
            const foto = await FotoKamarModel.getById(id_foto);
            if(!foto) {
                return res.status(404).json({message: 'Foto Kamar Tidak Ditemukan'});
            }
            res.status(200).json({data: foto});
        } catch ( error ) {
            console.error('FotoKamar getById error:', error);
            res.status(500).json({message: 'Internal Server Error'});
        }
    },

    create: async (req, res) => {
        try {
            const {id_kamar} = req.params;
            const {url, sort_order,is_primary} = req.body;
            const kamar = await KamarModel.getById(id_kamar);
            if(!kamar) {
                return res.status(404).json({message: 'Kamar Tidak Ditemukan'});
            }

            const result = await FotoKamarModel.create({
                id_kamar: id_kamar,
                url,
                sort_order,
                is_primary
            });
            res.status(201).json({message: 'Foto Kamar berhasil ditambahkan', data: result});

        } catch ( error ) {
            console.error('FotoKamar create error:', error);
            res.status(500).json({message: 'Internal Server Error'});
        }  
    },

    setPrimary: async (req, res) => {
        try {
            const {id_kamar, id_foto} = req.params;
            const kamar = await KamarModel.getById(id_kamar);
            if(!kamar) {
                return res.status(404).json({message: 'Kamar Tidak Ditemukan'});
            }
            
            const foto = await FotoKamarModel.getById(id_foto);
            if(!foto) {
                return res.status(404).json({message: 'Foto Kamar Tidak Ditemukan'});
            }

            if(foto.id_kamar != id_kamar) {
                return res.status(400).json({message: 'Foto Kamar Tidak Terkait dengan Kamar'});
            }

            const result = await FotoKamarModel.setPrimary (id_foto, id_kamar);
            res.status(200).json({message: 'Foto Kamar berhasil dijadikan primary', data: result});

        } catch ( error ) {
            console.error('FotoKamar setPrimary error:', error);
            res.status(500).json({message: 'Internal Server Error'});
        }
    },

    insertFoto: async(req, res) => {

        try {
            const imagePath = '/uploads/${req.file.filename}';
            FotoKamarModel.insertFoto({path: imagePath  });
            return res.status(200).json({message: "gambar berhasil di upload"});
        } catch (error) {
            res.status(500).json({message: "Ada kesalahan dan di catch"});
        }
    }

};

module.exports = FotoKamarController;