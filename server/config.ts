import dotenv from 'dotenv';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.string(),
  PORT: z.coerce.number().positive(),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number().positive(),
  DATABASE_NAME: z.string(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  IS_DATABASE_SSL_ENABLED: z.coerce.boolean()
});

dotenv.config();
const config = envSchema.parse(process.env);

export default config;
