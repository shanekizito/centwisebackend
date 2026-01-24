import axios from "axios";
import { config } from "../config";
import { AppError } from "../middlewares/errorHandler";
import logger from "../utils/logger";

export interface StkPushRequest {
    phone: string;
    amount: number;
}

export class MpesaService {
    private static async getAccessToken(): Promise<string> {
        const auth = Buffer.from(
            `${config.MPESA_CONSUMER_KEY}:${config.MPESA_CONSUMER_SECRET}`
        ).toString("base64");

        try {
            const response = await axios.get(
                "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                }
            );

            if (!response.data.access_token) {
                throw new AppError("Access token not received from Safaricom", 500, "MPESA_AUTH_ERROR");
            }

            return response.data.access_token;
        } catch (error: any) {
            logger.error("M-Pesa Token Generation Failed", {
                error: error.response?.data || error.message,
            });
            throw new AppError(
                "Failed to authenticate with M-Pesa",
                500,
                "MPESA_AUTH_ERROR"
            );
        }
    }

    private static getTimestamp(): string {
        const now = new Date();
        return (
            now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, "0") +
            now.getDate().toString().padStart(2, "0") +
            now.getHours().toString().padStart(2, "0") +
            now.getMinutes().toString().padStart(2, "0") +
            now.getSeconds().toString().padStart(2, "0")
        );
    }

    private static getPassword(timestamp: string): string {
        return Buffer.from(
            config.MPESA_BUSINESS_SHORT_CODE + config.MPESA_PASS_KEY + timestamp
        ).toString("base64");
    }

    static async initiateStkPush(data: StkPushRequest): Promise<any> {
        const token = await this.getAccessToken();
        const timestamp = this.getTimestamp();
        const password = this.getPassword(timestamp);

        const payload = {
            BusinessShortCode: config.MPESA_BUSINESS_SHORT_CODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerBuyGoodsOnline",
            Amount: data.amount,
            PartyA: data.phone,
            PartyB: config.MPESA_BUSINESS_SHORT_CODE, // Assuming standard shortcode or buygoods
            PhoneNumber: data.phone,
            CallBackURL: config.MPESA_CALLBACK_URL,
            AccountReference: "BuySasa Online Shop",
            TransactionDesc: "Payment for Order",
        };

        try {
            const response = await axios.post(
                "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            logger.info("M-Pesa STK Push Initiated", {
                checkoutRequestId: response.data.CheckoutRequestID,
                phone: data.phone
            });

            return response.data;
        } catch (error: any) {
            logger.error("M-Pesa STK Push Failed", {
                error: error.response?.data || error.message,
                phone: data.phone
            });
            throw new AppError(
                error.response?.data?.errorMessage || "Failed to initiate M-Pesa STK Push",
                error.response?.status || 500,
                "MPESA_STK_PUSH_ERROR"
            );
        }
    }

    static async queryStkStatus(checkoutRequestId: string): Promise<any> {
        const token = await this.getAccessToken();
        const timestamp = this.getTimestamp();
        const password = this.getPassword(timestamp);

        try {
            const response = await axios.post(
                "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query",
                {
                    BusinessShortCode: config.MPESA_BUSINESS_SHORT_CODE,
                    Password: password,
                    Timestamp: timestamp,
                    CheckoutRequestID: checkoutRequestId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return response.data;
        } catch (error: any) {
            logger.error("M-Pesa STK Query Failed", {
                error: error.response?.data || error.message,
                checkoutRequestId
            });
            throw new AppError(
                error.response?.data?.errorMessage || "Failed to query M-Pesa status",
                error.response?.status || 500,
                "MPESA_QUERY_ERROR"
            );
        }
    }
}
