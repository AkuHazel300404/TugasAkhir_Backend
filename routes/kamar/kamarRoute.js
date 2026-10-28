const KamarController = require('../../controllers/kamar/kamarController');
const express = require('express');
const router = express.Router();

const { authenticate, optionalAuth, authorize } = require('../../auth/middlewares/authMiddleware');
const adminOnly = [authenticate, authorize('admin')];// router.get('/', KamarController.getAll);
// router.get('/:id_kamar', KamarController.getById);
// router.post('/', KamarController.create);
// router.put('/:id_kamar', KamarController.update);
// router.patch('/:id_kamar/status', KamarController.updateStatus);
// router.patch('/:id_kamar/aktivasi', KamarController.activate);
// router.patch('/:id_kamar/deaktivasi', KamarController.deactivate);
// router.delete('/:id_kamar', KamarController.delete);

//publik
router.get('/kamar/', optionalAuth, KamarController.getAll);
router.get('/kamar/:id_kamar', optionalAuth, KamarController.getById);


router.post('/kamar/', adminOnly, KamarController.create);
router.put('/kamar/:id_kamar', adminOnly, KamarController.update);
router.patch('/kamar/:id_kamar/status', adminOnly, KamarController.updateStatus);
router.patch('/kamar/:id_kamar/aktivasi', adminOnly, KamarController.activate);
router.patch('/kamar/:id_kamar/deaktivasi', adminOnly, KamarController.deactivate);
router.delete('/kamar/:id_kamar', adminOnly, KamarController.delete);

module.exports = router;