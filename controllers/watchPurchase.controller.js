import Stripe from "stripe";
import { User } from "../models/user.model.js";
import { Watch } from "../models/watch.model.js";
import { Watch_Details } from "../models/watch_details.model.js";
import { WatchPurchase } from "../models/watchPurchase.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.id;
    const { watchId } = req.body;

    const watch = await Watch.findById(watchId);
    if (!watch) return res.status(404).json({ message: "Watch not found!" });

    // Create a new watch purchase record
    const newPurchase = new WatchPurchase({
      watchId,
      userId,
      amount: watch.watchPrice,
      status: "pending",
    });

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: watch.watchTitle,
              images: [watch.watchThumbnail],
            },
            unit_amount: watch.watchPrice * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://localhost:5173/watch-detail/${watchId}`, // once payment successful redirect to watch progress page
      cancel_url: `https://localhost:5173/watch-detail/${watchId}`,
      metadata: {
        watchId: watchId,
        userId: userId,
      },
      shipping_address_collection: {
        allowed_countries: ["IN"], // Optionally restrict allowed countries
      },
    });

    if (!session.url) {
      return res
        .status(400)
        .json({ success: false, message: "Error while creating session" });
    }

    // Save the purchase record
    newPurchase.paymentId = session.id;
    await newPurchase.save();

    return res.status(200).json({
      success: true,
      url: session.url, // Return the Stripe checkout URL
    });
  } catch (error) {
    console.log(error);
  }
};

export const stripeWebhook = async (req, res) => {
  let event;

  try {
    const payloadString = JSON.stringify(req.body, null, 2);
    const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret,
    });

    event = stripe.webhooks.constructEvent(payloadString, header, secret);
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  // Handle the checkout session completed event
  if (event.type === "checkout.session.completed") {
    console.log("check session complete is called");

    try {
      const session = event.data.object;

      const purchase = await WatchPurchase.findOne({
        paymentId: session.id,
      }).populate({ path: "watchId" });

      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      if (session.amount_total) {
        purchase.amount = session.amount_total / 100;
      }
      purchase.status = "completed";

      // Make all watch_detailss visible by setting `isPreviewFree` to true
      if (purchase.watchId && purchase.watchId.watch_detailss.length > 0) {
        await Watch_Details.updateMany(
          { _id: { $in: purchase.watchId.watch_detailss } },
          { $set: { isPreviewFree: true } }
        );
      }

      await purchase.save();

      // Update user's enrolledWatchs
      await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledWatchs: purchase.watchId._id } }, // Add watch ID to enrolledWatchs
        { new: true }
      );

      // Update watch to add user ID to enrolledBuyers
      await Watch.findByIdAndUpdate(
        purchase.watchId._id,
        { $addToSet: { enrolledBuyers: purchase.userId } }, // Add user ID to enrolledBuyers
        { new: true }
      );
    } catch (error) {
      console.error("Error handling event:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  res.status(200).send();
};
export const getWatchDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { watchId } = req.params;
    const userId = req.id;

    const watch = await Watch.findById(watchId)
      .populate({ path: "creator" })
      .populate({ path: "watch_detailss" });

    const purchased = await WatchPurchase.findOne({ userId, watchId });
    console.log(purchased);

    if (!watch) {
      return res.status(404).json({ message: "watch not found!" });
    }

    return res.status(200).json({
      watch,
      purchased: !!purchased, // true if purchased, false otherwise
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllPurchasedWatch = async (_, res) => {
  try {
    const purchasedWatch = await WatchPurchase.find({
      status: "completed",
    }).populate("watchId");
    if (!purchasedWatch) {
      return res.status(404).json({
        purchasedWatch: [],
      });
    }
    return res.status(200).json({
      purchasedWatch,
    });
  } catch (error) {
    console.log(error);
  }
};


