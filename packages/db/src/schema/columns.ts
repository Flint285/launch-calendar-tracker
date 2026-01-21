export type DatabaseType = 'postgres' | 'sqlite';

export function getDatabaseType(): DatabaseType {
  const dbType = process.env.DATABASE_TYPE || 'postgres';
  if (dbType !== 'postgres' && dbType !== 'sqlite') {
    throw new Error(`Invalid DATABASE_TYPE: ${dbType}. Must be 'postgres' or 'sqlite'`);
  }
  return dbType;
}

export function isSqlite(): boolean {
  return getDatabaseType() === 'sqlite';
}

export function isPostgres(): boolean {
  return getDatabaseType() === 'postgres';
}
