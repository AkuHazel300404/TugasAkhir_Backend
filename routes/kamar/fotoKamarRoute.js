const express = require('express');
const router = express.Router();
const fotoKamarController = require('../../controllers/kamar/fotoKamarController');
const { uploadImage } = require('../../auth/middlewares/uploadMiddleware');
const { authenticate, authorize } = require('../../auth/middlewares/authMiddleware');

router.post(
    '/kamar/:id_kamar/foto',
    authenticate,
    authorize('admin'),
    uploadImage('image'),
    fotoKamarController.insertFoto
);

module.exports = router;