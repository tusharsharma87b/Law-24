import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(5),
  JWT_ACCESS_SECRET: z.string().min(5).optional(),
  JWT_REFRESH_SECRET: z.string().min(5).optional(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_placeholder'),
  RAZORPAY_KEY_SECRET: z.string().default('placeholder'),
  APP_BASE_URL: z.string().url().default('http://localhost:4000'),
});
const parsed = envSchema.parse(process.env);
export const env = {
  ...parsed,
  JWT_ACCESS_SECRET: parsed.JWT_ACCESS_SECRET ?? parsed.JWT_SECRET,
  JWT_REFRESH_SECRET: parsed.JWT_REFRESH_SECRET ?? parsed.JWT_SECRET,
};
