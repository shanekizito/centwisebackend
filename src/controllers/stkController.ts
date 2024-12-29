import axios from "axios";
import { Response } from "express";
import { timestamp } from "../../utils/timeStamp";
import { RequestExtended } from "../middlewares/generateToken";
import ngrok from "ngrok";

const PORT = Number(process.env.PORT) || 5001;

const handleStkPush = async (req: RequestExtended, res: Response) => {
 
  try {
    const { phone, amount } = req.body;

    if (!req.token) {
      throw new Error("Access token not found");
    }

    const BUSINESS_SHORT_CODE = process.env.MPESA_BUSINESS_SHORT_CODE || "";
    const PASS_KEY = process.env.MPESA_PASS_KEY || "";

    // Ensure environment variables are set
    if (!BUSINESS_SHORT_CODE || !PASS_KEY) {
      throw new Error("Missing MPESA configuration in environment variables");
    }

   

   

    const CALLBACK_URL = `https://centwisebackend.onrender.com/payment-callback/`;

    // Correct timestamp generation
    const currentTimestamp = timestamp(); // Must return 'YYYYMMDDHHMMSS'

    const password = Buffer.from(
      BUSINESS_SHORT_CODE + PASS_KEY + currentTimestamp
    ).toString("base64");

    const payload = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: currentTimestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: BUSINESS_SHORT_CODE,
      PhoneNumber: phone,
      CallBackURL: CALLBACK_URL,
      AccountReference: "BuySasa Online Shop",
      TransactionDesc: "Payment for Order",
    };

    console.log("Token:", req.token);

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: {
          Authorization: `Bearer+${req.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("STK Push Response:", response.data);

    res.status(201).json({
      message: "STK Push initiated successfully",
      data: response.data,
    });
  } catch (error: any) {
    console.error("STK Push Error:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to initiate STK Push",
      error: error.response?.data || error.message,
    });
  }
};

export { handleStkPush };
