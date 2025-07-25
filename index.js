import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./database/db.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseWatch.route.js";
import userRoute from "./routes/user.route.js";
import watchRoute from "./routes/watch.route.js";
import watchProgressRoute from "./routes/watchProgress.route.js";

dotenv.config({});

// call database connection here
connectDB();
const app = express();

const PORT = process.env.PORT || 3000;

// default middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// apis
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/watch", watchRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", watchProgressRoute);


app.listen(PORT, () => {
    console.log(`Server listen at port ${PORT}`);
})


