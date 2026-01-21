import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  schema: './src/schema/sqlite.ts',
  out: './drizzle-sqlite',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.SQLITE_PATH || './data/launch-tracker.db',
  },
  verbose: true,
  strict: true,
});
