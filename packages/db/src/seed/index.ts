import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import bcrypt from 'bcryptjs';
import { getDatabaseType } from '../schema/columns.js';
import * as fs from 'fs';

// Find monorepo root by looking for pnpm-workspace.yaml
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function findMonorepoRoot(): string {
  let dir = __dirname;
  while (dir !== dirname(dir)) {
    if (fs.existsSync(resolve(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }
    dir = dirname(dir);
  }
  // Fallback: go up from packages/db/src/seed to root
  return resolve(__dirname, '../../../../');
}

const monorepoRoot = findMonorepoRoot();

// Load .env from the monorepo root
config({ path: resolve(monorepoRoot, '.env') });

async function seed() {
  const dbType = getDatabaseType();
  console.log(`Starting database seed (${dbType})...`);

  let db: any;
  let cleanup: () => Promise<void>;

  if (dbType === 'sqlite') {
    // SQLite setup
    const Database = (await import('better-sqlite3')).default;
    const { drizzle } = await import('drizzle-orm/better-sqlite3');
    const schema = await import('../schema/sqlite.js');
    const path = await import('path');

    const sqlitePath = process.env.SQLITE_PATH || './data/launch-tracker.db';

    // If path is relative, resolve from monorepo root
    const absolutePath = path.isAbsolute(sqlitePath)
      ? sqlitePath
      : path.resolve(monorepoRoot, sqlitePath);

    // Ensure directory exists
    const dir = path.dirname(absolutePath);
    if (dir && dir !== '.' && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const sqlite = new Database(absolutePath);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');

    db = drizzle(sqlite, { schema });
    cleanup = async () => sqlite.close();
  } else {
    // PostgreSQL setup
    const postgres = (await import('postgres')).default;
    const { drizzle } = await import('drizzle-orm/postgres-js');
    const schema = await import('../schema/postgres.js');

    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/launch_tracker';
    const sql = postgres(connectionString);

    db = drizzle(sql, { schema });
    cleanup = async () => { await sql.end(); };
  }

  try {
    // Create a default admin user
    const passwordHash = await bcrypt.hash('admin123', 10);

    const existingUser = await db.query.users.findFirst({
      where: (users: any, { eq }: any) => eq(users.email, 'admin@launchtracker.local'),
    });

    if (!existingUser) {
      // Import the correct schema for insert
      const schema = dbType === 'sqlite'
        ? await import('../schema/sqlite.js')
        : await import('../schema/postgres.js');

      await db.insert(schema.users).values({
        email: 'admin@launchtracker.local',
        passwordHash,
        name: 'Admin User',
        role: 'admin',
      });
      console.log('Created default admin user: admin@launchtracker.local / admin123');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await cleanup();
  }
}

seed();
