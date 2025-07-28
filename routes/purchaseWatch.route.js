import express from "express";
import { createCheckoutSession, getAllPurchasedWatch, getWatchDetailWithPurchaseStatus, stripeWebhook } from "../controllers/watchPurchase.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/checkout/create-checkout-session").post(isAuthenticated, createCheckoutSession);
router.route("/webhook").post(express.raw({ type: "application/json" }), stripeWebhook);
router.route("/watch/:watchId/detail-with-status").get(isAuthenticated, getWatchDetailWithPurchaseStatus);

router.route("/").get(isAuthenticated, getAllPurchasedWatch);

export default router;