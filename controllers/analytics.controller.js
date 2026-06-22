import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";

export const getAdminDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalOrders,
            completedOrders,
            pendingOrders,
            completedPayments,
            revenueResult
        ] = await Promise.all([
            User.countDocuments(),
            Order.countDocuments(),
            Order.countDocuments({ orderStatus: "confirmed" }),
            Order.countDocuments({ status: "pending" }),
            Payment.countDocuments({ status: "successful" }),
            Payment.aggregate([
                {
                    $match: {
                        status: "successful"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: {
                            $sum: "$amount"
                        }
                    }
                }
            ])
        ]);

        const totalRevenue =
            revenueResult.length > 0
                ? revenueResult[0].totalRevenue
                : 0;

        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalOrders,
                completedOrders,
                pendingOrders,
                completedPayments,
                totalRevenue
            }
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};