const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', AdminController.getAll);
router.get('/aktif', AdminController.getAllAktif);
router.get('/:id', AdminController.getById);
router.get('/aktif/:id', AdminController.getByIdAktif);
router.post('/', AdminController.create);
router.put('/:id', AdminController.update);
router.put('/deaktivasi/:id', AdminController.deaktivasi);
router.put('/aktivasi/:id', AdminController.aktivasi);  


module.exports = router;