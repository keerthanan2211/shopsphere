import { z } from 'zod';

/**
 * Validates environment variables once at startup, so a missing secret fails fast
 * with a clear message instead of breaking later at runtime.
 */
const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(5000),
    CLIENT_URL: z.string().url().default('http://localhost:5173'),
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    // Secure cookies need HTTPS; defaults to on in production. Set false for plain-http local Docker.
    COOKIE_SECURE: z.enum(['true', 'false']).optional(),
    PAYMENT_MODE: z.enum(['mock', 'stripe']).default('mock'),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
  })
  .refine((e) => e.PAYMENT_MODE !== 'stripe' || (e.STRIPE_SECRET_KEY && e.STRIPE_WEBHOOK_SECRET), {
    message: 'PAYMENT_MODE=stripe needs STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET',
  });

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) console.error(`  - ${issue.path.join('.') || 'env'}: ${issue.message}`);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const cookieSecure = env.COOKIE_SECURE ? env.COOKIE_SECURE === 'true' : isProd;
