import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoute from "./routes/auth.route.js";
import bookRoute from "./routes/book.route.js";
import userRoute from "./routes/user.route.js";
import cartRoute from "./routes/cart.route.js";
import orderRoute from "./routes/order.route.js";
import paymentRoute from "./routes/payment.route.js";
import analyticsRoute from "./routes/analytics.route.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import yaml from "js-yaml";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

dotenv.config();

const PORT = process.env.PORT || 3000;
const swaggerDocument = yaml.load(fs.readFileSync("./swagger.yaml", "utf-8"));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiter);

app.use("/api/auth", authRoute);
app.use("/api/books", bookRoute);
app.use("/api/users", userRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/analytics", analyticsRoute);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
  });
});

const start = () => {
  try {
    mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
