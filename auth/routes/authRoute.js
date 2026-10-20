const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/authController');
const loginLimiter = require('../middlewares/rateLimiter');       // middlewares, bukan middleware
const { authenticate, authorize } = require('../middlewares/authMiddleware'); // middlewares, bukan middleware

// Endpoint login dipisah per entitas karena model/tabelnya berbeda
router.post('/admin/login', loginLimiter, AuthController.loginAdmin);
router.post('/user/login', loginLimiter, AuthController.loginUser);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.me);

// Registrasi user: publik, tapi tetap dibatasi rate limit supaya tidak dispam
router.post('/user/register', loginLimiter, AuthController.registerUser);

router.put('/user/password', authenticate, authorize('user'), loginLimiter, AuthController.changePasswordUser);

// Registrasi admin: SENGAJA diproteksi authenticate + authorize('admin').
// Artinya admin baru hanya bisa dibuat oleh admin yang sudah login,
// bukan endpoint publik yang bisa diakses siapa saja.
router.post(
  '/admin/register',
  authenticate,
  authorize('admin'),
  AuthController.registerAdmin
);

// Contoh route yang diproteksi, hanya bisa diakses admin yang sudah login
router.get('/admin/dashboard', authenticate, authorize('admin'), (req, res) => {
  res.json({ success: true, message: `Halo admin ${req.user.email}` });
});

// Contoh route yang diproteksi, hanya bisa diakses user yang sudah login
router.get('/user/profile', authenticate, authorize('user'), (req, res) => {
  res.json({ success: true, message: `Halo user ${req.user.email}` });
});

module.exports = router;