const CustomerController = require('../controllers/customerController');
const express = require('express');
const router = express.Router();

router.get('/customer', CustomerController.getAll);
router.get('/customer/data', CustomerController.getAllData);
router.get('/customer/:id_customer', CustomerController.getById);
router.post('/customer', CustomerController.create);
router.put('/customer/:id_customer', CustomerController.update);
router.put('/customer/:id_customer/blacklist', CustomerController.blacklist);
router.put('/customer/:id_customer/whitelist', CustomerController.whitelist);
router.delete('/customer/:id_customer', CustomerController.delete);
router.put('/customer/:id_customer/deactivate', CustomerController.deactivate);

module.exports = router;