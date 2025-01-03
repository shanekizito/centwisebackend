import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { timestamp } from "../../utils/timeStamp";
import { RequestExtended } from "../middlewares/generateToken";
export const paymentCallback = async (
  req: RequestExtended,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const Timestampstring = timestamp

    const encodingPassword = `174379${process.env.MPESA_PASS_KEY}${Timestampstring}`;
    const base64PasswordEncoded = Buffer.from(encodingPassword).toString("base64");

    const { CheckoutRequestID } = req.body;
    const BUSINESS_SHORT_CODE = process.env.MPESA_BUSINESS_SHORT_CODE || "";

    if (!CheckoutRequestID) {
      res.status(400).json({ message: "CheckoutRequestID is required" });
      return;
    }
    console.log("STK Push Payload:", req.token);

    const response = await axios.post(
      "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query",
      {
        BusinessShortCode: BUSINESS_SHORT_CODE,
        Password: base64PasswordEncoded,
        Timestamp: Timestampstring,
        CheckoutRequestID: CheckoutRequestID,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${req.token}`, // req.token is now correctly typed
        },
      }
    );

    res.status(200).json({
      message: "Payment processed successfully.",
      data: response.data,
    });
  } catch (error: any) {
    console.error("Payment Callback Error:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to process payment.",
      error: error.response?.data || error.message,
    });
  }
};
