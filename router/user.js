const express = require('express');
const router = express.Router();
const userController = require('../controller/user');
const productControllers = require('../controller/product')
const { verifyToken } = require('../middleware/verify');

router.post('/send-otp', userController.sendOtp);
router.post('/verify-otp', verifyToken, userController.verifyOtp);
router.post('/create-profile', verifyToken, userController.createProfile);

router.post('/add-product', productControllers.addProduct);
router.get('/get-product', productControllers.getProducts);
router.post('/add-to-cart', verifyToken, productControllers.addToCart);
router.get('/checkout', verifyToken, productControllers.checkout);



module.exports = router;
