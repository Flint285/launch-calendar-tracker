import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../schema/postgres.js';

export function createPostgresDatabase() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/launch_tracker';
  const queryClient = postgres(connectionString);

  return drizzle(queryClient, { schema });
}

export { schema };
