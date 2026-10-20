const ReservasiController = require('../../controllers/reservasi/reservasiController');
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../auth/middlewares/authMiddleware');

router.get('/reservasi/saya', authenticate, authorize('user'), ReservasiController.getMine);
router.post('/reservasi', authenticate, authorize('user'), ReservasiController.create);
router.get('/reservasi', authenticate, authorize('admin'), ReservasiController.getAll);
router.patch('/reservasi/:id_reservasi/setujui', authenticate, authorize('admin'), ReservasiController.approve);
router.patch('/reservasi/:id_reservasi/tolak', authenticate, authorize('admin'), ReservasiController.reject);
router.patch('/reservasi/:id_reservasi/batal', authenticate, authorize('user'), ReservasiController.cancel);

module.exports = router;