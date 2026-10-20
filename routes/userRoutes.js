const UserController = require('../controllers/userController');
const express = require('express');
const router = express.Router();
const { authenticate, authorize, authorizeSelfOrAdmin } = require('../auth/middlewares/authMiddleware');

// JANGAN pakai router.use(authenticate): router ini di-mount di '/api',
// jadi akan ikut mencegat /api/reservasi. Proteksi dipasang per-route.
const adminOnly = [authenticate, authorize('admin')];
const authorized = [authenticate, authorize('admin', 'user')];

router.put('/user/me', authenticate, authorize('user'), UserController.updateMe);
router.get('/user/:id_user', authenticate, authorizeSelfOrAdmin('id_user'), UserController.getById);


router.get('/user', adminOnly, UserController.getAll);
router.get('/user/data', adminOnly, UserController.getAllData);
router.get('/user/:id_user', adminOnly, UserController.getById);
router.post('/user', adminOnly, UserController.create);
router.put('/user/:id_user', adminOnly, UserController.update);
router.put('/user/:id_user/blacklist', adminOnly, UserController.blacklist);
router.put('/user/:id_user/whitelist', adminOnly, UserController.whitelist);
router.delete('/user/:id_user', adminOnly, UserController.delete);
router.put('/user/:id_user/deactivate', adminOnly, UserController.deactivate);


module.exports = router;