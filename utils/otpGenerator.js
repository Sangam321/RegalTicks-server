export const generateOTP = () => {
    // Generate a 6-digit numeric OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateOTPExpiry = () => {
    // Generate expiry date (10 minutes from now)
    return new Date(Date.now() + 10 * 60 * 1000);
};