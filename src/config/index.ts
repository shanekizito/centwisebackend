import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5001").transform(Number),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MPESA_CONSUMER_KEY: z.string().min(1, "MPESA_CONSUMER_KEY is required"),
  MPESA_CONSUMER_SECRET: z.string().min(1, "MPESA_CONSUMER_SECRET is required"),
  MPESA_BUSINESS_SHORT_CODE: z.string().min(1, "MPESA_BUSINESS_SHORT_CODE is required"),
  MPESA_PASS_KEY: z.string().min(1, "MPESA_PASS_KEY is required"),
  MPESA_CALLBACK_URL: z.string().url("MPESA_CALLBACK_URL must be a valid URL"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const config = parsed.data;
