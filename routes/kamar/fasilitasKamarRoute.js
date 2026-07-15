const FasilitasKamarController = require('../../controllers/kamar/fasilitasKamarController');
const express = require('express');
const router = express.Router();    

router.get('/fasilitas/', FasilitasKamarController.getAll);
router.get('/fasilitas/:id_fasilitas_kamar', FasilitasKamarController.getById);
router.get('/kamar/:id_kamar/fasilitas', FasilitasKamarController.getByKamar);
router.post('/fasilitas/', FasilitasKamarController.create);
router.delete('/fasilitas/:id_fasilitas_kamar', FasilitasKamarController.delete);

module.exports = router;