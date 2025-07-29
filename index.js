import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from 'fs';
import https from 'https';
import connectDB from "./database/db.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseWatch.route.js";
import userRoute from "./routes/user.route.js";
import watchRoute from "./routes/watch.route.js";
import watchProgressRoute from "./routes/watchProgress.route.js";


dotenv.config();


const app = express();


connectDB();


const PORT = process.env.PORT || 3000;

// SSL Certificate configuration
const sslOptions = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
};

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: "https://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    next();
});

// Routes
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/watch", watchRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", watchProgressRoute);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Create HTTPS server
const server = https.createServer(sslOptions, app);

// Start server
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`HTTPS Server listening on port ${PORT}`);
    console.log(`CORS configured for: https://localhost:5173`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});