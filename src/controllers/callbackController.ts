import { Request, Response, NextFunction } from "express";
import axios from "axios";
import axiosRetry from "axios-retry";
import { timestamp } from "../../utils/timeStamp";
import { RequestExtended } from "../middlewares/generateToken";

// Set up Axios Retry
axiosRetry(axios, {
  retries: 3, // Number of retry attempts
  retryDelay: (retryCount) => {
    console.log(`Retrying request: attempt ${retryCount}`);
    return retryCount * 1000; // Delay between retries (in milliseconds)
  },
  retryCondition: (error) => {
    // Retry only for network errors or status codes 5xx
    return axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error);
  },
});

export const paymentCallback = async (
  req: RequestExtended,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Generate the timestamp
    const Timestampstring = timestamp();

    // Validate environment variables
    const BUSINESS_SHORT_CODE = process.env.MPESA_BUSINESS_SHORT_CODE;
    const MPESA_PASS_KEY = process.env.MPESA_PASS_KEY;

    if (!BUSINESS_SHORT_CODE || !MPESA_PASS_KEY) {
      throw new Error("Missing M-Pesa Business Short Code or Pass Key in environment variables.");
    }

    // Generate Base64-encoded password
    const encodingPassword = `${BUSINESS_SHORT_CODE}${MPESA_PASS_KEY}${Timestampstring}`;
    const base64PasswordEncoded = Buffer.from(encodingPassword).toString("base64");

    const { CheckoutRequestID } = req.body;

    if (!CheckoutRequestID) {
      res.status(400).json({ message: "CheckoutRequestID is required" });
      return;
    }

    console.log("STK Push Query Payload:", {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Timestamp: Timestampstring,
      CheckoutRequestID,
    });

    // Make the API request with Axios Retry
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
          Authorization: `Bearer ${req.token}`,
        },
      }
    );

    console.log("STK Push Query Success Response:", response.data);

    res.status(200).json({
      message: "Payment processed successfully.",
      data: response.data,
    });
  } catch (error: any) {
    // Log full error details for debugging
    console.error("Payment Callback Error:", {
      message: error.message,
      config: error.config,
      responseData: error.response?.data,
    });

    // Handle different error scenarios
    if (error.response?.data) {
      const { errorCode, errorMessage } = error.response.data;
      res.status(500).json({
        message: "Failed to process payment.",
        errorCode,
        errorMessage,
      });
    } else if (error.code === "ECONNABORTED") {
      res.status(504).json({
        message: "Request timed out. Please try again.",
      });
    } else {
      res.status(500).json({
        message: "Failed to process payment.",
        error: error.message,
      });
    }
  }
};
