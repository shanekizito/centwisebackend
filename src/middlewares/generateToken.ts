import axios from "axios";
import { NextFunction, Request, Response } from "express";

// Extend the Request type to include the token property
export interface RequestExtended extends Request {
  token?: string;
}

export const generateToken = async (
  req: RequestExtended,
  _res: Response,
  next: NextFunction
) => {
  const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY as string;
  const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET as string;

  const URL =
    "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString(
    "base64"
  );

  try {
    const response = await axios.get(URL, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    console.log(response.data);

    req.token = response.data.access_token;

    if (!req.token) {
      throw new Error("Access token not generated");
    }

    console.log("Access Token:", req.token); // Log token for debugging
    next();
  } catch (error: any) {
    console.error("Error generating token:", error.response?.data || error.message);
    _res.status(500).json({
      message: "Failed to generate access token",
      error: error.response?.data || error.message,
    });
  }
};
