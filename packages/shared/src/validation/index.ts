import { z } from 'zod';
import {
  TaskStatus,
  TaskPriority,
  TaskCategory,
  KpiCategory,
  KpiUnit,
  KpiTargetType,
  ContactSegment,
  ContactStatus,
  OutreachChannel,
  OutreachOutcome,
  AlertSeverity,
  UserRole,
  PlanStatus,
} from '../types/index.js';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// Launch Plan Schemas
export const createPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(255),
  timezone: z.string().default('America/Chicago'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  strategyTags: z.array(z.string()).default([]),
  notes: z.string().nullable().optional(),
  templateId: z.string().optional(),
});

export const updatePlanSchema = createPlanSchema.partial().extend({
  status: z.enum([PlanStatus.DRAFT, PlanStatus.ACTIVE, PlanStatus.COMPLETED, PlanStatus.ARCHIVED]).optional(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;

// Task Schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(500),
  description: z.string().nullable().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)').nullable().optional(),
  estimatedMinutes: z.number().int().positive().nullable().optional(),
  status: z.enum([TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED, TaskStatus.COMPLETE, TaskStatus.SKIPPED]).default(TaskStatus.NOT_STARTED),
  priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH]).default(TaskPriority.MEDIUM),
  category: z.enum([TaskCategory.PRODUCT, TaskCategory.FUNNEL, TaskCategory.OUTREACH, TaskCategory.EMAIL, TaskCategory.ADS, TaskCategory.ANALYTICS, TaskCategory.SUPPORT, TaskCategory.OTHER]).default(TaskCategory.OTHER),
  ownerId: z.number().int().positive().nullable().optional(),
  links: z.array(z.string().url()).default([]),
  dependsOn: z.array(z.number().int().positive()).default([]),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  completionNotes: z.string().nullable().optional(),
});

export const bulkCreateTasksSchema = z.object({
  tasks: z.array(createTaskSchema),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type BulkCreateTasksInput = z.infer<typeof bulkCreateTasksSchema>;

// KPI Schemas
export const createKpiSchema = z.object({
  name: z.string().min(1, 'KPI name is required').max(255),
  category: z.enum([KpiCategory.EMAIL_DELIVERABILITY, KpiCategory.FUNNEL_CONVERSION, KpiCategory.REVENUE, KpiCategory.ACTIVATION, KpiCategory.ADS]),
  unit: z.enum([KpiUnit.PERCENT, KpiUnit.COUNT, KpiUnit.CURRENCY, KpiUnit.RATIO]),
  targetType: z.enum([KpiTargetType.MINIMUM, KpiTargetType.MAXIMUM]),
  targetValue: z.number(),
  calculationType: z.enum(['manual', 'calculated']).default('manual'),
  numeratorKey: z.string().nullable().optional(),
  denominatorKey: z.string().nullable().optional(),
});

export const updateKpiSchema = createKpiSchema.partial();

export const createKpiEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  value: z.number(),
  notes: z.string().nullable().optional(),
});

export type CreateKpiInput = z.infer<typeof createKpiSchema>;
export type UpdateKpiInput = z.infer<typeof updateKpiSchema>;
export type CreateKpiEntryInput = z.infer<typeof createKpiEntrySchema>;

// Contact Schemas
export const createContactSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().nullable().optional(),
  segment: z.enum([ContactSegment.PAST_PAYER, ContactSegment.COLD_LIST]),
  status: z.enum([ContactStatus.NOT_CONTACTED, ContactStatus.CONTACTED, ContactStatus.REPLIED, ContactStatus.BOOKED_CALL, ContactStatus.STARTED_TRIAL, ContactStatus.PAID_STARTER, ContactStatus.PAID_PRO, ContactStatus.UNSUBSCRIBED]).default(ContactStatus.NOT_CONTACTED),
  tags: z.array(z.string()).default([]),
  notes: z.string().nullable().optional(),
});

export const updateContactSchema = createContactSchema.partial();

export const importContactsSchema = z.object({
  contacts: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
    segment: z.enum([ContactSegment.PAST_PAYER, ContactSegment.COLD_LIST]),
    tags: z.array(z.string()).optional(),
  })),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ImportContactsInput = z.infer<typeof importContactsSchema>;

// Outreach Event Schemas
export const createOutreachEventSchema = z.object({
  contactId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  channel: z.enum([OutreachChannel.EMAIL, OutreachChannel.DM, OutreachChannel.CALL]),
  templateKey: z.string().nullable().optional(),
  outcome: z.enum([OutreachOutcome.DELIVERED, OutreachOutcome.REPLIED, OutreachOutcome.CLICKED, OutreachOutcome.CONVERTED]),
  notes: z.string().nullable().optional(),
});

export type CreateOutreachEventInput = z.infer<typeof createOutreachEventSchema>;

// Alert Schemas
export const resolveAlertSchema = z.object({
  resolutionNotes: z.string().min(1, 'Resolution notes are required'),
});

export type ResolveAlertInput = z.infer<typeof resolveAlertSchema>;

// Asset Schemas
export const createAssetSchema = z.object({
  title: z.string().min(1, 'Asset title is required').max(255),
  type: z.string().min(1),
  url: z.string().url().nullable().optional(),
  linkedTaskId: z.number().int().positive().nullable().optional(),
  linkedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateAssetSchema = createAssetSchema.partial();

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;

// Note Schemas
export const createNoteSchema = z.object({
  linkedType: z.enum(['day', 'task', 'kpi', 'contact']),
  linkedId: z.union([z.number().int().positive(), z.string()]),
  content: z.string().min(1, 'Note content is required'),
});

export const updateNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
