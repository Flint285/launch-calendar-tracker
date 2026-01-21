import { pgTable, text, timestamp, integer, date, jsonb, real, boolean, serial, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// USERS
// ============================================
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').default('admin').notNull(), // 'admin' | 'collaborator'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  plans: many(launchPlans),
  assignedTasks: many(tasks),
}));

// ============================================
// LAUNCH PLANS
// ============================================
export const launchPlans = pgTable('launch_plans', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  timezone: text('timezone').default('America/Chicago').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  strategyTags: jsonb('strategy_tags').$type<string[]>().default([]).notNull(),
  notes: text('notes'),
  status: text('status').default('draft').notNull(), // 'draft' | 'active' | 'completed' | 'archived'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id').references(() => launchPlans.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: date('due_date').notNull(),
  dueTime: text('due_time'), // HH:MM format
  estimatedMinutes: integer('estimated_minutes'),
  status: text('status').default('not_started').notNull(), // 'not_started' | 'in_progress' | 'blocked' | 'complete' | 'skipped'
  priority: text('priority').default('medium').notNull(), // 'low' | 'medium' | 'high'
  category: text('category').default('other').notNull(), // 'product' | 'funnel' | 'outreach' | 'email' | 'ads' | 'analytics' | 'support' | 'other'
  ownerId: integer('owner_id').references(() => users.id),
  links: jsonb('links').$type<string[]>().default([]).notNull(),
  completionNotes: text('completion_notes'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
export const taskDependencies = pgTable('task_dependencies', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  dependsOnTaskId: integer('depends_on_task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
export const kpis = pgTable('kpis', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id').references(() => launchPlans.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'email_deliverability' | 'funnel_conversion' | 'revenue' | 'activation' | 'ads'
  unit: text('unit').notNull(), // 'percent' | 'count' | 'currency' | 'ratio'
  targetType: text('target_type').notNull(), // 'minimum' | 'maximum'
  targetValue: real('target_value').notNull(),
  calculationType: text('calculation_type').default('manual').notNull(), // 'manual' | 'calculated'
  numeratorKey: text('numerator_key'),
  denominatorKey: text('denominator_key'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
export const kpiEntries = pgTable('kpi_entries', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id').references(() => launchPlans.id, { onDelete: 'cascade' }).notNull(),
  kpiId: integer('kpi_id').references(() => kpis.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  value: real('value').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
export const alerts = pgTable('alerts', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id').references(() => launchPlans.id, { onDelete: 'cascade' }).notNull(),
  kpiId: integer('kpi_id').references(() => kpis.id, { onDelete: 'set null' }),
  dateTriggered: date('date_triggered').notNull(),
  severity: text('severity').default('warning').notNull(), // 'info' | 'warning' | 'critical'
  message: text('message').notNull(),
  resolvedAt: timestamp('resolved_at'),
  resolutionNotes: text('resolution_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id').references(() => launchPlans.id, { onDelete: 'cascade' }).notNull(),
  email: text('email').notNull(),
  name: text('name'),
  segment: text('segment').notNull(), // 'past_payer' | 'cold_list'
  status: text('status').default('not_contacted').notNull(), // 'not_contacted' | 'contacted' | 'replied' | 'booked_call' | 'started_trial' | 'paid_starter' | 'paid_pro' | 'unsubscribed'
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
export const outreachEvents = pgTable('outreach_events', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id').references(() => launchPlans.id, { onDelete: 'cascade' }).notNull(),
  contactId: integer('contact_id').references(() => contacts.id, { onDelete: 'cascade' }).notNull(),
  date: date('date').notNull(),
  channel: text('channel').notNull(), // 'email' | 'dm' | 'call'
  templateKey: text('template_key'),
  outcome: text('outcome').notNull(), // 'delivered' | 'replied' | 'clicked' | 'converted'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id').references(() => launchPlans.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  type: text('type').notNull(), // e.g., 'sample_output', 'ad_creative', 'landing_page', 'email_draft'
  url: text('url'),
  linkedTaskId: integer('linked_task_id').references(() => tasks.id, { onDelete: 'set null' }),
  linkedDate: date('linked_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id').references(() => launchPlans.id, { onDelete: 'cascade' }).notNull(),
  linkedType: text('linked_type').notNull(), // 'day' | 'task' | 'kpi' | 'contact'
  linkedId: text('linked_id').notNull(), // ID or date string
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notesRelations = relations(notes, ({ one }) => ({
  plan: one(launchPlans, {
    fields: [notes.planId],
    references: [launchPlans.id],
  }),
}));
