const TipeKamarController = require('../../controllers/kamar/tipeKamarController');
const express = require('express');
const router = express.Router();

// router.get('/', TipeKamarController.getAll);
// router.get('/:id_tipe_kamar', TipeKamarController.getById);
// router.post('/', TipeKamarController.create);
// router.put('/:id_tipe_kamar', TipeKamarController.update);
// router.delete('/:id_tipe_kamar', TipeKamarController.delete);


router.get('/tipe-kamar/', TipeKamarController.getAll);
router.get('/tipe-kamar/:id_tipe_kamar', TipeKamarController.getById);
router.post('/tipe-kamar/', TipeKamarController.create);
router.put('/tipe-kamar/:id_tipe_kamar', TipeKamarController.update);
router.delete('/tipe-kamar/:id_tipe_kamar', TipeKamarController.delete);

module.exports = router;