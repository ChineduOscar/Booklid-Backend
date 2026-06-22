import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    }
});


const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [orderItemSchema],
    total: {
        type: Number,   
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending"
    },
    orderStatus: {
        type: String,
        enum:  ["pending", "confirmed", "delivered", "cancelled"],
        default: "pending",
    },

}, {timestamps: true})

const Order = mongoose.model("Order", orderSchema)

export default Order