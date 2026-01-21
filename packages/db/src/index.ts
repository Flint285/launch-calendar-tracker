import { getDatabaseType, isSqlite } from './schema/columns.js';

// Lazy loading of database drivers to prevent unnecessary connections
let db: any;
let schema: any;

const dbType = getDatabaseType();

if (dbType === 'sqlite') {
  // Only load SQLite driver when needed
  const sqliteModule = await import('./drivers/sqlite.js');
  db = sqliteModule.createSqliteDatabase();
  schema = sqliteModule.schema;
} else {
  // Only load PostgreSQL driver when needed
  const postgresModule = await import('./drivers/postgres.js');
  db = postgresModule.createPostgresDatabase();
  schema = postgresModule.schema;
}

export { db, schema };

// Re-export schema types from the PostgreSQL schema for TypeScript compatibility
export * from './schema/index.js';
