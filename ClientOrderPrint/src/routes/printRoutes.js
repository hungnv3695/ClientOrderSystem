const express = require('express');
const router = express.Router();
const printController = require('../controllers/printController');

// Test printer connection
router.get('/test', printController.testPrinter);

// Print receipt
router.post('/receipt', printController.printReceipt);

module.exports = router;
