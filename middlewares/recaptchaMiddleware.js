import axios from "axios";

export const verifyRecaptcha = async (req, res, next) => {
    // Skip reCAPTCHA verification for login route
    if (req.path === '/login') {
        return next();
    }

    const { recaptchaToken } = req.body;

    if (!recaptchaToken) {
        return res.status(400).json({
            success: false,
            message: "reCAPTCHA token is required"
        });
    }

    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            null, // No data in request body
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: recaptchaToken
                }
            }
        );

        if (!response.data.success) {
            console.error("reCAPTCHA failed with errors:", response.data["error-codes"]);
            return res.status(400).json({
                success: false,
                message: "reCAPTCHA verification failed",
                errors: response.data["error-codes"] || []
            });
        }

        next();
    } catch (error) {
        console.error("reCAPTCHA API error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error verifying reCAPTCHA"
        });
    }
};