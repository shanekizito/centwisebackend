import { Request, Response } from "express";
import { MpesaService } from "../services/mpesaService";

export const handleStkPush = async (req: Request, res: Response) => {
  const { phone, amount } = req.body;
  const result = await MpesaService.initiateStkPush({ phone, amount });

  res.status(201).json({
    status: "success",
    message: "STK Push initiated successfully",
    data: result,
  });
};
