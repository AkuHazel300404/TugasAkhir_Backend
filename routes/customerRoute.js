const CustomerController = require('../controllers/customerController');
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../auth/middlewares/authMiddleware');

const adminOnly = [authenticate, authorize('admin')];

router.get('/customer', adminOnly, CustomerController.getAll);
router.get('/customer/data', adminOnly, CustomerController.getAllData);
router.get('/customer/:id_customer', adminOnly, CustomerController.getById);
router.post('/customer', adminOnly, CustomerController.create);
router.put('/customer/:id_customer', adminOnly, CustomerController.update);
router.put('/customer/:id_customer/blacklist', adminOnly, CustomerController.blacklist);
router.put('/customer/:id_customer/whitelist', adminOnly, CustomerController.whitelist);
router.delete('/customer/:id_customer', adminOnly, CustomerController.delete);
router.put('/customer/:id_customer/deactivate', adminOnly, CustomerController.deactivate);

module.exports = router;