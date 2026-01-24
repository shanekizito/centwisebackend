import { z } from "zod";

export const stkPushSchema = z.object({
    body: z.object({
        phone: z.string().regex(/^(?:254|\+254|0)?(7|1)\d{8}$/, "Invalid Kenyan phone number"),
        amount: z.number().positive("Amount must be greater than 0"),
    }),
});

export const callbackQuerySchema = z.object({
    body: z.object({
        CheckoutRequestID: z.string().min(1, "CheckoutRequestID is required"),
    }),
});
