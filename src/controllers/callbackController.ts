import { Request, Response } from "express";
import { MpesaService } from "../services/mpesaService";

export const paymentCallback = async (req: Request, res: Response) => {
  const { CheckoutRequestID } = req.body;
  const result = await MpesaService.queryStkStatus(CheckoutRequestID);

  res.status(200).json({
    status: "success",
    message: "Payment status retrieved successfully",
    data: result,
  });
};
