const express = require('express');
const router = express.Router();
const AuthController = require('./authController');

router.post('/login', AuthController.loginAdmin);

module.exports = router;