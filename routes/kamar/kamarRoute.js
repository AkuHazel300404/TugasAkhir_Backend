const KamarController = require('../../controllers/kamar/kamarController');
const express = require('express');
const router = express.Router();

// router.get('/', KamarController.getAll);
// router.get('/:id_kamar', KamarController.getById);
// router.post('/', KamarController.create);
// router.put('/:id_kamar', KamarController.update);
// router.patch('/:id_kamar/status', KamarController.updateStatus);
// router.patch('/:id_kamar/aktivasi', KamarController.activate);
// router.patch('/:id_kamar/deaktivasi', KamarController.deactivate);
// router.delete('/:id_kamar', KamarController.delete);

router.get('/kamar/', KamarController.getAll);
router.get('/kamar/:id_kamar', KamarController.getById);
router.post('/kamar/', KamarController.create);
router.put('/kamar/:id_kamar', KamarController.update);
router.patch('/kamar/:id_kamar/status', KamarController.updateStatus);
router.patch('/kamar/:id_kamar/aktivasi', KamarController.activate);
router.patch('/kamar/:id_kamar/deaktivasi', KamarController.deactivate);
router.delete('/kamar/:id_kamar', KamarController.delete);

module.exports = router;