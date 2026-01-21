import { sql, SQL } from 'drizzle-orm';
import { isSqlite } from '../schema/columns.js';

/**
 * Cross-database compatible count that returns an integer
 * PostgreSQL: count(*)::int
 * SQLite: count(*)
 */
export function countAsInt(): SQL<number> {
  if (isSqlite()) {
    return sql<number>`count(*)`;
  }
  return sql<number>`count(*)::int`;
}

/**
 * Cross-database compatible filtered count
 * PostgreSQL: count(*) filter (where condition)::int
 * SQLite: sum(case when condition then 1 else 0 end)
 */
export function countWhere(condition: SQL): SQL<number> {
  if (isSqlite()) {
    return sql<number>`sum(case when ${condition} then 1 else 0 end)`;
  }
  return sql<number>`count(*) filter (where ${condition})::int`;
}

/**
 * Cross-database compatible boolean OR aggregation
 * PostgreSQL: bool_or(condition)
 * SQLite: max(case when condition then 1 else 0 end) = 1
 */
export function boolOr(condition: SQL): SQL<boolean> {
  if (isSqlite()) {
    return sql<boolean>`max(case when ${condition} then 1 else 0 end) = 1`;
  }
  return sql<boolean>`bool_or(${condition})`;
}

/**
 * Cross-database compatible IN clause with array
 * Works the same for both databases, but provides a convenient helper
 */
export function inArray<T>(column: SQL, values: T[]): SQL {
  if (values.length === 0) {
    return sql`1 = 0`; // Always false for empty array
  }
  const placeholders = values.map((_, i) => sql`${values[i]}`);
  return sql`${column} IN (${sql.join(placeholders, sql`, `)})`;
}
