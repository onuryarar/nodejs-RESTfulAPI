const express = require('express');
const router = express.Router();
const authorization = require('../middleaware/check-auth');

const OrderController = require('../controllers/orders');

router.get('/', authorization, OrderController.get_all);

router.get('/:orderId', authorization, OrderController.get_single);

router.post('/', authorization, OrderController.create);

router.delete('/:orderId', authorization, OrderController.delete);

module.exports = router;