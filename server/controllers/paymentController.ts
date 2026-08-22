import crypto from "crypto";
import { Request, Response } from "express";
import razorpay from "../config/razorpay.js";
import { prisma } from "../config/prisma.js";

export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res
        .status(500)
        .json({ message: "Razorpay is not configured on the server" });
    }

    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res
        .status(400)
        .json({ message: "Amount and orderId are required" });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user!.id },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentMethod !== "RAZORPAY") {
      return res
        .status(400)
        .json({ message: "Order is not a Razorpay payment order" });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: "Order is already paid" });
    }

    if (Math.round(Number(amount) * 100) !== Math.round(order.total * 100)) {
      return res.status(400).json({ message: "Amount does not match order total" });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: orderId,
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  } catch (error: any) {
    console.error("Create Razorpay order error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to create Razorpay order" });
  }
};

export const verifyRazorpayPayment = async (req: Request, res: Response) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res
        .status(500)
        .json({ message: "Razorpay is not configured on the server" });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user!.id },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.razorpayOrderId && order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: "Invalid Razorpay order ID" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    });

    res.json({ success: true, message: "Payment successful" });
  } catch (error: any) {
    console.error("Verify Razorpay payment error:", error);
    res
      .status(500)
      .json({ message: error.message || "Payment verification failed" });
  }
};
