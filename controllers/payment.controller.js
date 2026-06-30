import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";
import Cart from "../models/cart.model.js";
import axios from "axios";
import crypto from "crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export const initializePayment = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await Order.create({
      user: userId,
      items: cart.items,
      total: totalAmount,
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    const paystackResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email: req.user.email,
        amount: totalAmount * 100,
        callback_url: "https://booklide.netlify.app/payment/success",
        metadata: {
          userId,
          orderId: order._id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const { reference, authorization_url } = paystackResponse.data.data;

    await Payment.create({
      user: userId,
      order: order._id,
      amount: totalAmount,
      status: "pending",
      transactionRef: reference,
    });

    return res.status(200).json({
      message: "Payment initialized",
      authorization_url,
      orderId: order._id,
    });
  } catch (error) {
    console.error(
      "Error initializing payment:",
      error?.response?.data || error,
    );
    res.status(500).json({ message: "Error initializing payment" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

    const paystackRes = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const data = paystackRes.data.data;

    const payment = await Payment.findOne({ transactionRef: reference });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (payment.status === "successful") {
      return res.status(200).json({
        message: "Payment already verified",
        data: payment,
      });
    }

    if (data.status === "success") {
      payment.status = "successful";
      payment.paymentMethod = data.channel;
      payment.paidAt = data.paid_at;

      await payment.save();

      await Order.findByIdAndUpdate(
        payment.order,
        { orderStatus: "confirmed" },
        { new: true, useValidators: true },
      );

      return res.status(200).json({
        message: "Payment verified successfully",
        data: payment,
      });
    } else {
      payment.status = "failed";
      await payment.save();

      return res
        .status(400)
        .json({ message: "Payment verification failed", data: payment });
    }
  } catch (error) {
    console.error("Error verifying payment:", error?.response?.data || error);
    res.status(500).json({ message: "Error verifying payment" });
  }
};

export const getAllUserPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const payment = await Payment.find()
      .populate("user", "fullName email")
      .populate("order")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "All payments fetched successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching all payments:", error);
    res.status(500).json({ message: "Error fetching all payments" });
  }
};

export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;

    const payment = await Payment.find({ user: userId })
      .populate("order")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Payments fetched successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Error fetching payments" });
  }
};

export const getPaymentByReference = async (req, res) => {
  try {
    const { reference } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({
      transactionRef: reference,
      user: userId,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({
      message: "Payment fetched successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ message: "Error fetching payment" });
  }
};

export const paystackWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== signature) {
      return res.status(401).send("Invalid signature");
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const { reference } = event.data;

      const payment = await Payment.findOne({ transactionRef: reference });

      if (!payment) return res.sendStatus(404);

      if (payment.status === "successful") return res.sendStatus(200);

      payment.status = "successful";
      payment.paymentMethod = event.data.channel;
      payment.paidAt = event.data.paid_at;
      await payment.save();

      await Order.findByIdAndUpdate(payment.order, {
        orderStatus: "confirmed",
        paymentStatus: "paid",
      });

      await Cart.findOneAndDelete({ user: payment.user });
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.sendStatus(500);
  }
};
