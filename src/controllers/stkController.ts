import axios from "axios";
import { Response } from "express";
import { timestamp } from "../../utils/timeStamp";
import { RequestExtended } from "../middlewares/generateToken";
import { getNgrokUrl } from "../../utils/ngrokManager";

const handleStkPush = async (req: RequestExtended, res: Response) => {
  try {
    const { phone, amount } = req.body;

    if (!req.token || typeof req.token !== "string" || req.token.trim() === "") {
      throw new Error("Invalid or missing access token");
    }

    const BUSINESS_SHORT_CODE = process.env.MPESA_BUSINESS_SHORT_CODE || "";
    const PASS_KEY = process.env.MPESA_PASS_KEY || "";
    console.log("Business Short Code:", BUSINESS_SHORT_CODE,"PASS_KEY",PASS_KEY);

    if (!BUSINESS_SHORT_CODE || !PASS_KEY) {
      throw new Error("Missing MPESA configuration in environment variables");
    }

    const tunnelUrl = getNgrokUrl();
    if (!tunnelUrl) {
      throw new Error("Ngrok tunnel URL not initialized");
    }

    const CALLBACK_URL = `${tunnelUrl}/payment-callback/`;
    

    const currentTimestamp = timestamp(); // Must return 'YYYYMMDDHHMMSS'

    const password = Buffer.from(
      BUSINESS_SHORT_CODE + PASS_KEY + currentTimestamp
    ).toString("base64");  

    const payload = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: currentTimestamp,
      TransactionType: "CustomerBuyGoodsOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: 3092728,
      PhoneNumber: phone,
      CallBackURL: CALLBACK_URL,
      AccountReference: "BuySasa Online Shop",
      TransactionDesc: "Payment for Order",
    };

    const response = await axios.post(
      "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: {
          Authorization: `Bearer ${req.token}`,
          "Content-Type": "application/json",
        },
      }
    );

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
