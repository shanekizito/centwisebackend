import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AppError } from "./errorHandler";

export const validate =
    (schema: AnyZodObject) =>
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                await schema.parseAsync({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });
                return next();
            } catch (error) {
                if (error instanceof ZodError) {
                    return next(
                        new AppError(
                            `Validation Error: ${error.errors
                                .map((e) => e.message)
                                .join(", ")}`,
                            400,
                            "VALIDATION_ERROR"
                        )
                    );
                }
                return next(error);
            }
        };
