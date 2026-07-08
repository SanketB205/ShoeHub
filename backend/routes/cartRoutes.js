const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth); // Protect all cart routes

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.delete('/remove/:productId/:size', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);
router.post('/sync', cartController.syncCart);

module.exports = router;
