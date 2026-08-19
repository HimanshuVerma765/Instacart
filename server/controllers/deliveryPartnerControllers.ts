import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateToken = (id: string) => {
  return jwt.sign({ id, role: "delivery" }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
};

// Login delivery partner
// POST: /api/delivery/login
export const Login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }

  const partner = await prisma.deliveryPartner.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!partner) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (!partner.isActive) {
    return res.status(401).json({ message: "Delivery partner is not active" });
  }

  const isMatch = await bcrypt.compare(password, partner.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = generateToken(partner.id);

  const { password: _, ...partnerData } = partner;

  res.json({ token, partner: partnerData });
};

// Get assigned deeliveries
// GET: /api/delivery/my-deliveries
export const getMyDeliveries = async (req: Request, res: Response) => {
  const { status } = req.query;

  const where: any = { deliveryPartnerId: req.user!.id };

  if (status === "active") {
    where.status = { in: ["Assigned", "Packed", "Out for Delivery"] };
  } else if (status === "completed") {
    where.status = { in: ["Delivered", "Cancelled"] };
  }

  const orders = await prisma.order.findMany({
    where,
    include: { user: { select: { name: true, email: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.json({ orders });
};

// Get single delivery detail
// Get: /api/dellivery/my-deliveries/:id
export const getDeliveryDetail = async (req: Request, res: Response) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id as string, deliveryPartnerId: req.partner!.id },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });

  if (!order) {
    return res.status(401).json({ message: "Delivery not found" });
  }

  res.json({ order });
};

// Complete delivery with OTP
// PUT: /api/delivery/my-deliveries/:id/complete
export const completeDelivery = async (req: Request, res: Response) => {
  const { otp } = req.body;
  const order = await prisma.order.findFirst({
    where: { id: req.params.id as string, deliveryPartnerId: req.partner!.id },
  });
  if (!order || order.status === "Cancelled" || order.status === "Delivered") {
    return res.status(400).json({ message: "Invalid Request" });
  }

  if (order.deliveryOtp !== otp) {
    return res.status(500).json({ message: "Invalid OTP" });
  }

  const history = order.statusHistory as any[];

  history.push({
    status: "Delivered",
    note: "Delivered by delivery partner",
    timestamp: new Date(),
  });

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: "Delivered", statusHistory: history, deliveryOtp: "" },
  });

  res.json({ order: updatedOrder, message: "Delivery completed successfully" });
};
