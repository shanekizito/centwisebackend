import express from "express";
import { handleStkPush } from "../controllers/stkController";
import { paymentCallback } from "../controllers/callbackController";
import { validate } from "../middlewares/validation";
import { stkPushSchema, callbackQuerySchema } from "../validation/mpesaValidation";

const router = express.Router();

router.post(
    "/stkpush",
    validate(stkPushSchema),
    handleStkPush
);

router.post(
    "/payment-callback",
    validate(callbackQuerySchema),
    paymentCallback
);

export default router;
