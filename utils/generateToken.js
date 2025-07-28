import jwt from "jsonwebtoken";


export const generateToken = (userId) => {
  if (!process.env.SECRET_KEY) {
    throw new Error("SECRET_KEY is not defined in environment variables");
  }

  return jwt.sign({ userId }, process.env.SECRET_KEY, {
    expiresIn: "1d"
  });
};