import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),
});

function validateEnv() {
  const result = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  });

  if (!result.success) {
    const missingVars = result.error.issues.map((issue) => issue.path.join("."));
    // IMPORTANT: Never log actual values — only variable names
    throw new Error(
      `Missing or invalid environment variables: ${missingVars.join(", ")}`
    );
  }

  return result.data;
}

// Only validate in server context (not during build/test when env may not be present)
export const env =
  typeof window === "undefined" && process.env.NODE_ENV !== "test"
    ? validateEnv()
    : ({} as z.infer<typeof envSchema>);

export type Env = z.infer<typeof envSchema>;
