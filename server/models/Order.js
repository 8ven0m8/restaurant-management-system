const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 20
    },
    items: [{
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'preparing', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('Order', orderSchema);
