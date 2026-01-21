import { config } from 'dotenv';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
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
  // Fallback: go up from packages/db to root
  return path.resolve(__dirname, '../../');
}

const monorepoRoot = findMonorepoRoot();

// Load .env from monorepo root
config({ path: path.join(monorepoRoot, '.env') });

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

console.log(`Applying migration to SQLite database at: ${absolutePath}`);

const db = new Database(absolutePath);

// Enable foreign keys and WAL mode
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Read the migration file
const migrationPath = path.join(__dirname, 'drizzle-sqlite', '0000_spotty_dracula.sql');
const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

// Split by statement-breakpoint and execute each statement
const statements = migrationSql.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);

console.log(`Found ${statements.length} statements to execute`);

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  try {
    db.exec(stmt);
    console.log(`✓ Executed statement ${i + 1}/${statements.length}`);
  } catch (error: any) {
    // Ignore "table already exists" errors
    if (error.message.includes('already exists')) {
      console.log(`⚠ Statement ${i + 1}/${statements.length}: Table already exists, skipping`);
    } else {
      console.error(`✗ Failed statement ${i + 1}/${statements.length}:`, error.message);
      throw error;
    }
  }
}

// Create the drizzle migration tracking table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS __drizzle_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

// Mark migration as applied
const hash = '0000_spotty_dracula';
const existing = db.prepare('SELECT * FROM __drizzle_migrations WHERE hash = ?').get(hash);
if (!existing) {
  db.prepare('INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)').run(hash, Date.now());
  console.log('✓ Recorded migration in tracking table');
}

db.close();
console.log('✓ Migration completed successfully!');
