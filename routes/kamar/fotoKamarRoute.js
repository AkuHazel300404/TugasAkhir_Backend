const express = require('express');
const router = express.Router();
const fotoKamarController = require('../../controllers/kamar/fotoKamarController');
const upload = require('../../middlewares/uploadMiddleware');

router.post('/foto', upload.single('image'), fotoKamarController.insertFoto);

module.exports = router;