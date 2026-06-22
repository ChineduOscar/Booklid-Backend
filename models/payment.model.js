import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },

    amount: {
        type: Number,
        required: true,
    },

    currency: {
        type: String,
        default: "NGN",
    },

    paymentMethod: {
        type: String,
        enum: ["card", "bank_transfer"],
    },

    status: {
        type: String,
        enum: ["pending", "successful", "failed"],
        default: "pending",
    },

    transactionRef: {
        type: String,
        unique: true,
    },

    paidAt: {
        type: Date,
        default: null,
    },
}, {timestamps: true})

const Payment = mongoose.model('Payment', paymentSchema)

export default Payment