// Re-export everything from columns
export * from './columns.js';

// Re-export from PostgreSQL schema (default for types and when DATABASE_TYPE=postgres)
// The actual runtime schema selection happens in the main index.ts
export * from './postgres.js';
