import { Response } from "express";
import logger from "../utils/logger";

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public errorCode?: string
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export const errorHandler = (
    err: any,
    req: any,
    res: Response,
    next: any
) => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err.message || "Internal Server Error";
    const errorCode = err instanceof AppError ? err.errorCode : "INTERNAL_ERROR";

    logger.error(message, {
        statusCode,
        errorCode,
        path: req.path,
        method: req.method,
        stack: err.stack,
    });

    res.status(statusCode).json({
        status: "error",
        message,
        errorCode,
        // stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
