const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    productCode: {
        type: String,
        unique: true
    },
    toalReviews: {
        type: String,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Number
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'DELETED'],
        default: 'ACTIVE'
    }
},
    {
        timestamps: true,
        versionKey: false
    }
);
const Product = mongoose.model('Products', productSchema);

module.exports = Product;
