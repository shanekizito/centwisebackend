import express from "express";
import { handleStkPush } from "../controllers/stkController";
import { generateToken } from "../middlewares/generateToken";
import { paymentCallback } from "../controllers/callbackController";

const router = express.Router();

// Middleware chain: Generate token first, then handle STK push
router.post("/stkpush", handleStkPush);
router.post("/payment-callback", generateToken,paymentCallback);




export default router;
