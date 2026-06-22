import Order from '../models/order.model.js';
import Cart from '../models/cart.model.js';

export const placeOrder = async (req, res) => {
    try{
        const userId = req.user.id
        const cart = await Cart.findOne({ user: userId })

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const totalAmount = cart.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const order = await Order.create({
            user: userId,
            items: cart.items,
            total: totalAmount,
            paymentStatus: "pending",
            orderStatus: "pending"
        })

        await Cart.findOneAndDelete({ user: userId });

        res.status(201).json({
            message: "Order placed successfully",
            data: order
        })

    }catch(error){
        console.error("Error placing order:", error);
        res.status(500).json({message: "Error placing order"})
    }
}

export const getOrders = async (req, res) => {
    try{
        const userId = req.user.id
        const orders = await Order.find({ user: userId }).populate("items.book")

        if(!orders || orders.length === 0){
            return res.status(404).json({message: "No orders found"})
        }

        res.status(200).json({
            message: "Orders fetched successfully",
            data: orders
        })
    }catch(error){
        console.error("Error fetching orders:", error);
        res.status(500).json({message: "Error fetching orders"})
    }
}

export const getOrderById = async (req, res) => {
    try{
        const id = req.params.id

        const order = await Order.findOne({ _id: id, user: req.user.id }).populate("items.book")

        if(!order){
            return res.status(404).json({message: "Order not found"})
        }

        res.status(200).json({
            message: "Order fetched successfully",
            data: order
        })
    }catch(error){
        console.error("Error fetching order:", error);
        res.status(500).json({message: "Error fetching order"})
    }
}

export const getAllOrders = async (req, res) => {
    try{
        const orders = await Order.find().populate("items.book").populate("user", "fullName email")

        if(!orders || orders.length === 0){
            return res.status(404).json({message: "No orders found"})
        }

        res.status(200).json({
            message: "Orders fetched successfully",
            data: orders
        })
    }catch(error){
        console.error("Error fetching orders:", error);
        res.status(500).json({message: "Error fetching orders"})
    }
}

export const updateOrderStatus = async (req, res) => {
    try{
        const id = req.params.id
        const { orderStatus } = req.body

        const allowed = ["pending", "confirmed", "delivered", "cancelled"];

        if (!allowed.includes(orderStatus)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const order = await Order.findById(id)

        if(!order){
            return res.status(404).json({message: "Order not found"})
        }

        order.orderStatus = orderStatus

        const updatedOrder = await order.save()

        res.status(200).json({
            message: "Order status updated successfully",
            data: updatedOrder
        })
    }catch(error){
        console.error("Error updating order status:", error);
        res.status(500).json({message: "Error updating order status"})
    }
}

export const cancelOrder = async (req, res) => {
    try{
        const id = req.params.id
        const userId = req.user.id

        const order = await Order.findOne({ _id: id, user: userId })

        if(!order){
            return res.status(404).json({message: "Order not found"})
        }

        if (order.orderStatus !== "pending") {
            return res.status(400).json({
                message: `Order cannot be cancelled. Current status: ${order.orderStatus}`,
            });
        }

        if (order.paymentStatus === "paid") {
            return res.status(400).json({
                message: "Paid orders cannot be cancelled"
            });
        }

        order.orderStatus = "cancelled"
        const cancelledOrder = await order.save()

        res.status(200).json({
            message: "Order cancelled successfully",
            data: cancelledOrder
        })  
    }catch(error){
        console.error("Error cancelling order:", error);
        res.status(500).json({message: "Error cancelling order"})
    }
}

