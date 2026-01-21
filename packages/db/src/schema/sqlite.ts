import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

// ============================================
// USERS
// ============================================
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').default('admin').notNull(), // 'admin' | 'collaborator'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  plans: many(launchPlans),
  assignedTasks: many(tasks),
}));

// ============================================
// LAUNCH PLANS
// ============================================
export const launchPlans = sqliteTable('launch_plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  timezone: text('timezone').default('America/Chicago').notNull(),
  startDate: text('start_date').notNull(), // ISO date string YYYY-MM-DD
  endDate: text('end_date').notNull(), // ISO date string YYYY-MM-DD
  strategyTags: text('strategy_tags', { mode: 'json' }).$type<string[]>().default([]).notNull(),
  notes: text('notes'),
  status: text('status').default('draft').notNull(), // 'draft' | 'active' | 'completed' | 'archived'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const launchPlansRelations = relations(launchPlans, ({ one, many }) => ({
  user: one(users, {
    fields: [launchPlans.userId],
    references: [users.id],
  }),
  tasks: many(tasks),
  kpis: many(kpis),
  contacts: many(contacts),
  alerts: many(alerts),
  assets: many(assets),
  notes: many(notes),
}));

// ============================================
// TASKS
// ============================================
export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  planId: integer('plan_id').references(() => launchPlans.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: text('due_date').notNull(), // ISO date string YYYY-MM-DD
  dueTime: text('due_time'), // HH:MM format
  estimatedMinutes: integer('estimated_minutes'),
  status: text('status').default('not_started').notNull(), // 'not_started' | 'in_progress' | 'blocked' | 'complete' | 'skipped'
  priority: text('priority').default('medium').notNull(), // 'low' | 'medium' | 'high'
  category: text('category').default('other').notNull(), // 'product' | 'funnel' | 'outreach' | 'email' | 'ads' | 'analytics' | 'support' | 'other'
  ownerId: integer('owner_id').references(() => users.id),
  links: text('links', { mode: 'json' }).$type<string[]>().default([]).notNull(),
  completionNotes: text('completion_notes'),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  plan: one(launchPlans, {
    fields: [tasks.planId],
    references: [launchPlans.id],
  }),
  owner: one(users, {
    fields: [tasks.ownerId],
    references: [users.id],
  }),
  dependencies: many(taskDependencies, { relationName: 'taskDependencies' }),
  dependents: many(taskDependencies, { relationName: 'dependentTasks' }),
  assets: many(assets),
}));

// ============================================
// TASK DEPENDENCIES
// ============================================
export const taskDependencies = sqliteTable('task_dependencies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  dependsOnTaskId: integer('depends_on_task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  uniqueDependency: uniqueIndex('unique_dependency').on(table.taskId, table.dependsOnTaskId),
}));

export const taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
  task: one(tasks, {
    fields: [taskDependencies.taskId],
    references: [tasks.id],
    relationName: 'taskDependencies',
  }),
  dependsOn: one(tasks, {
    fields: [taskDependencies.dependsOnTaskId],
    references: [tasks.id],
    relationName: 'dependentTasks',
  }),
}));

// ============================================
// KPIS
// ============================================
export const kpis = sqliteTable('kpis', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  planId: integer('plan_id').references(() => launchPlans.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'email_deliverability' | 'funnel_conversion' | 'revenue' | 'activation' | 'ads'
  unit: text('unit').notNull(), // 'percent' | 'count' | 'currency' | 'ratio'
  targetType: text('target_type').notNull(), // 'minimum' | 'maximum'
  targetValue: real('target_value').notNull(),
  calculationType: text('calculation_type').default('manual').notNull(), // 'manual' | 'calculated'
  numeratorKey: text('numerator_key'),
  denominatorKey: text('denominator_key'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const kpisRelations = relations(kpis, ({ one, many }) => ({
  plan: one(launchPlans, {
    fields: [kpis.planId],
    references: [launchPlans.id],
  }),
  entries: many(kpiEntries),
  alerts: many(alerts),
}));

// ============================================
// KPI ENTRIES
// ============================================
export const kpiEntries = sqliteTable('kpi_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  planId: integer('plan_id').references(() => launchPlans.id, { onDelete: 'cascade' }).notNull(),
  kpiId: integer('kpi_id').references(() => kpis.id, { onDelete: 'cascade' }).notNull(),
  date: text('date').notNull(), // ISO date string YYYY-MM-DD
  value: real('value').notNull(),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  uniqueEntry: uniqueIndex('unique_kpi_entry').on(table.kpiId, table.date),
}));

export const kpiEntriesRelations = relations(kpiEntries, ({ one }) => ({
  plan: one(launchPlans, {
    fields: [kpiEntries.planId],
    references: [launchPlans.id],
  }),
  kpi: one(kpis, {
    fields: [kpiEntries.kpiId],
    references: [kpis.id],
  }),
}));

// ============================================
// ALERTS
// ============================================
export const alerts = sqliteTable('alerts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  planId: integer('plan_id').references(() => launchPlans.id, { onDelete: 'cascade' }).notNull(),
  kpiId: integer('kpi_id').references(() => kpis.id, { onDelete: 'set null' }),
  dateTriggered: text('date_triggered').notNull(), // ISO date string YYYY-MM-DD
  severity: text('severity').default('warning').notNull(), // 'info' | 'warning' | 'critical'
  message: text('message').notNull(),
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
  resolutionNotes: text('resolution_notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const alertsRelations = relations(alerts, ({ one }) => ({
  plan: one(launchPlans, {
    fields: [alerts.planId],
    references: [launchPlans.id],
  }),
  kpi: one(kpis, {
    fields: [alerts.kpiId],
    references: [kpis.id],
  }),
}));

// ============================================
// CONTACTS
// ============================================
export const contacts = sqliteTable('contacts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  planId: integer('plan_id').references(() => launchPlans.id, { onDelete: 'cascade' }).notNull(),
  email: text('email').notNull(),
  name: text('name'),
  segment: text('segment').notNull(), // 'past_payer' | 'cold_list'
  status: text('status').default('not_contacted').notNull(), // 'not_contacted' | 'contacted' | 'replied' | 'booked_call' | 'started_trial' | 'paid_starter' | 'paid_pro' | 'unsubscribed'
  tags: text('tags', { mode: 'json' }).$type<string[]>().default([]).notNull(),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  plan: one(launchPlans, {
    fields: [contacts.planId],
    references: [launchPlans.id],
  }),
  outreachEvents: many(outreachEvents),
}));

// ============================================
// OUTREACH EVENTS
// ============================================
export const outreachEvents = sqliteTable('outreach_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  planId: integer('plan_id').references(() => launchPlans.id, { onDelete: 'cascade' }).notNull(),
  contactId: integer('contact_id').references(() => contacts.id, { onDelete: 'cascade' }).notNull(),
  date: text('date').notNull(), // ISO date string YYYY-MM-DD
  channel: text('channel').notNull(), // 'email' | 'dm' | 'call'
  templateKey: text('template_key'),
  outcome: text('outcome').notNull(), // 'delivered' | 'replied' | 'clicked' | 'converted'
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const outreachEventsRelations = relations(outreachEvents, ({ one }) => ({
  plan: one(launchPlans, {
    fields: [outreachEvents.planId],
    references: [launchPlans.id],
  }),
  contact: one(contacts, {
    fields: [outreachEvents.contactId],
    references: [contacts.id],
  }),
}));

// ============================================
// ASSETS
// ============================================
export const assets = sqliteTable('assets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  planId: integer('plan_id').references(() => launchPlans.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  type: text('type').notNull(), // e.g., 'sample_output', 'ad_creative', 'landing_page', 'email_draft'
  url: text('url'),
  linkedTaskId: integer('linked_task_id').references(() => tasks.id, { onDelete: 'set null' }),
  linkedDate: text('linked_date'), // ISO date string YYYY-MM-DD
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const assetsRelations = relations(assets, ({ one }) => ({
  plan: one(launchPlans, {
    fields: [assets.planId],
    references: [launchPlans.id],
  }),
  linkedTask: one(tasks, {
    fields: [assets.linkedTaskId],
    references: [tasks.id],
  }),
}));

// ============================================
// NOTES
// ============================================
export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  planId: integer('plan_id').references(() => launchPlans.id, { onDelete: 'cascade' }).notNull(),
  linkedType: text('linked_type').notNull(), // 'day' | 'task' | 'kpi' | 'contact'
  linkedId: text('linked_id').notNull(), // ID or date string
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const notesRelations = relations(notes, ({ one }) => ({
  plan: one(launchPlans, {
    fields: [notes.planId],
    references: [launchPlans.id],
  }),
}));
