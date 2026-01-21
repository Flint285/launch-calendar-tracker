import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../schema/sqlite.js';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find monorepo root by looking for pnpm-workspace.yaml
function findMonorepoRoot(): string {
  let dir = __dirname;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  // Fallback: go up from packages/db/src/drivers to root
  return path.resolve(__dirname, '../../../../');
}

export function createSqliteDatabase() {
  const sqlitePath = process.env.SQLITE_PATH || './data/launch-tracker.db';

  // If path is relative, resolve from monorepo root
  const absolutePath = path.isAbsolute(sqlitePath)
    ? sqlitePath
    : path.resolve(findMonorepoRoot(), sqlitePath);
  console.log(`[SQLite] Database path: ${absolutePath}`);
  console.log(`[SQLite] File exists: ${fs.existsSync(absolutePath)}`);

  // Ensure directory exists
  const dir = path.dirname(absolutePath);
  if (dir && dir !== '.' && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const sqlite = new Database(absolutePath);
  // Enable WAL mode for better concurrent access
  sqlite.pragma('journal_mode = WAL');
  // Enable foreign keys
  sqlite.pragma('foreign_keys = ON');

  return drizzle(sqlite, { schema });
}

export { schema };
