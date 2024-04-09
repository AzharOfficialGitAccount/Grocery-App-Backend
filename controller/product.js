const Product = require('../model/product');
const User = require('../model/user');
const Cart = require('../model/cart');

module.exports = {

    addProduct: async (req, res) => {
        try {
            const { productName, description, price, productCode, quantity } = req.body;
            if (!productName) {
                return res.status(400).json({ status: false, message: "Please provide product Name" });
            }
            if (!price) {
                return res.status(400).json({ status: false, message: "Please provide product price" });
            }
            if (!productCode) {
                return res.status(400).json({ status: false, message: "Please provide product code" });
            }
            if (!quantity) {
                return res.status(400).json({ status: false, message: "Please provide product quantity" });
            }
            const checkProducts = await Product.find({ productCode });
            if (checkProducts.length > 0) {
                return res.status(400).json({ status: false, message: "Product already exists" });
            }
            const productObj = new Product({
                productName,
                description,
                price,
                quantity,
                productCode
            });
            const products = await productObj.save();
            const result = {

                productName: products.productName,
                description: products.description,
                price: products.price,
                quantity: products.quantity,
                totalRatings: products.totalRatings,
                toalReviews: products.toalReviews,
                productCode: products.productCode,
            }
            return res.status(200).json({ status: true, message: "Product created successfully", result });
        } catch (error) {
            console.error("Error", error);
            return res.status(500).json({ status: false, message: "An error occurred", error: error.message });
        }
    },


    getProducts: async (req, res) => {
        try {
            const checkProducts = await Product.find();
            if (!checkProducts || checkProducts.length === 0) {
                return res.status(400).json({ status: false, message: "Products not found" });
            }
            const results = checkProducts.map(product => ({
                productName: product.productName,
                description: product.description,
                price: product.price,
                quantity: product.quantity,
                totalRatings: product.totalRatings,
                totalReviews: product.totalReviews,
                productCode: product.productCode
            }));
            return res.status(200).json({ status: true, message: "Products found successfully", results });
        } catch (error) {
            console.error("Error", error);
            return res.status(500).json({ status: false, message: "An error occurred", error: error.message });
        }
    },

    addToCart: async (req, res) => {
        try {
            const { productId, quantity } = req.body;
            const userId = req.token;

            if (!productId || !quantity) {
                return res.status(400).json({ status: false, message: "Please provide productId and quantity" });
            }

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ status: false, message: "Product not found" });
            }
            if (product.quantity < quantity) {
                return res.status(400).json({ status: false, message: "Insufficient stock" });
            }

            product.quantity -= quantity;
            await product.save();

            let cart = await Cart.findOne({ userId });
            if (!cart) {
                cart = new Cart({ userId, items: [{ productId, quantity, totalPrice: product.price * quantity }] });
            } else {
                const existingItem = cart.items.find(item => String(item.productId) === String(productId));
                if (existingItem) {
                    existingItem.quantity += quantity;
                    existingItem.totalPrice = product.price * existingItem.quantity;
                } else {
                    cart.items.push({ productId, quantity, totalPrice: product.price * quantity });
                }
            }
            cart.totalCartValue = cart.items.reduce((total, item) => total + item.totalPrice, 0);
            await cart.save();

            return res.status(200).json({ status: true, message: "Product added to cart successfully", cart });
        } catch (error) {
            console.error("Error", error);
            return res.status(500).json({ status: false, message: "An error occurred", error: error.message });
        }
    },

    checkout: async (req, res) => {
        try {
            const userId = req.token;

            const cart = await Cart.findOne({ userId });
            if (!cart || cart.items.length === 0) {
                return res.status(404).json({ status: false, message: "Cart is empty" });
            }

            const cartItems = await Promise.all(cart.items.map(async (cartItem) => {
                const product = await Product.findById(cartItem.productId);
                if (!product) {
                    return null;
                }
                return {
                    _id: cartItem._id,
                    product: {
                        _id: product._id,
                        productName: product.productName,
                        description: product.description,
                        price: product.price,
                        quantity: cartItem.quantity,
                        totalPrice: cartItem.totalPrice
                    }
                };
            }));

            const validCartItems = cartItems.filter(item => item !== null);
            const totalCartValue = validCartItems.reduce((total, item) => total + item.product.totalPrice, 0);
            const user = await User.findById(userId);

            return res.status(200).json({
                status: true,
                message: "Checkout successful",
                contact: user.phoneNumber,
                email: user.email,
                userName: user.userName,
                gender: user.gender,
                cart: validCartItems,
                totalCartValue
            });
        } catch (error) {
            console.error("Error", error);
            return res.status(500).json({ status: false, message: "An error occurred", error: error.message });
        }
    }



}

