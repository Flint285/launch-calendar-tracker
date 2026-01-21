// Enums
export const TaskStatus = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  BLOCKED: 'blocked',
  COMPLETE: 'complete',
  SKIPPED: 'skipped',
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

export const TaskCategory = {
  PRODUCT: 'product',
  FUNNEL: 'funnel',
  OUTREACH: 'outreach',
  EMAIL: 'email',
  ADS: 'ads',
  ANALYTICS: 'analytics',
  SUPPORT: 'support',
  OTHER: 'other',
} as const;

export type TaskCategory = (typeof TaskCategory)[keyof typeof TaskCategory];

export const KpiCategory = {
  EMAIL_DELIVERABILITY: 'email_deliverability',
  FUNNEL_CONVERSION: 'funnel_conversion',
  REVENUE: 'revenue',
  ACTIVATION: 'activation',
  ADS: 'ads',
} as const;

export type KpiCategory = (typeof KpiCategory)[keyof typeof KpiCategory];

export const KpiUnit = {
  PERCENT: 'percent',
  COUNT: 'count',
  CURRENCY: 'currency',
  RATIO: 'ratio',
} as const;

export type KpiUnit = (typeof KpiUnit)[keyof typeof KpiUnit];

export const KpiTargetType = {
  MINIMUM: 'minimum',
  MAXIMUM: 'maximum',
} as const;

export type KpiTargetType = (typeof KpiTargetType)[keyof typeof KpiTargetType];

export const ContactSegment = {
  PAST_PAYER: 'past_payer',
  COLD_LIST: 'cold_list',
} as const;

export type ContactSegment = (typeof ContactSegment)[keyof typeof ContactSegment];

export const ContactStatus = {
  NOT_CONTACTED: 'not_contacted',
  CONTACTED: 'contacted',
  REPLIED: 'replied',
  BOOKED_CALL: 'booked_call',
  STARTED_TRIAL: 'started_trial',
  PAID_STARTER: 'paid_starter',
  PAID_PRO: 'paid_pro',
  UNSUBSCRIBED: 'unsubscribed',
} as const;

export type ContactStatus = (typeof ContactStatus)[keyof typeof ContactStatus];

export const OutreachChannel = {
  EMAIL: 'email',
  DM: 'dm',
  CALL: 'call',
} as const;

export type OutreachChannel = (typeof OutreachChannel)[keyof typeof OutreachChannel];

export const OutreachOutcome = {
  DELIVERED: 'delivered',
  REPLIED: 'replied',
  CLICKED: 'clicked',
  CONVERTED: 'converted',
} as const;

export type OutreachOutcome = (typeof OutreachOutcome)[keyof typeof OutreachOutcome];

export const AlertSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
} as const;

export type AlertSeverity = (typeof AlertSeverity)[keyof typeof AlertSeverity];

export const UserRole = {
  ADMIN: 'admin',
  COLLABORATOR: 'collaborator',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const PlanStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

export type PlanStatus = (typeof PlanStatus)[keyof typeof PlanStatus];

// Entity Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export interface LaunchPlan {
  id: number;
  userId: number;
  name: string;
  timezone: string;
  startDate: string;
  endDate: string;
  strategyTags: string[];
  notes: string | null;
  status: PlanStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: number;
  planId: number;
  title: string;
  description: string | null;
  dueDate: string;
  dueTime: string | null;
  estimatedMinutes: number | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  ownerId: number | null;
  links: string[];
  completionNotes: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskDependency {
  id: number;
  taskId: number;
  dependsOnTaskId: number;
}

export interface Kpi {
  id: number;
  planId: number;
  name: string;
  category: KpiCategory;
  unit: KpiUnit;
  targetType: KpiTargetType;
  targetValue: number;
  calculationType: 'manual' | 'calculated';
  numeratorKey: string | null;
  denominatorKey: string | null;
  createdAt: Date;
}

export interface KpiEntry {
  id: number;
  planId: number;
  kpiId: number;
  date: string;
  value: number;
  notes: string | null;
  createdAt: Date;
}

export interface Alert {
  id: number;
  planId: number;
  kpiId: number | null;
  dateTriggered: string;
  severity: AlertSeverity;
  message: string;
  resolvedAt: Date | null;
  resolutionNotes: string | null;
  createdAt: Date;
}

export interface Contact {
  id: number;
  planId: number;
  email: string;
  name: string | null;
  segment: ContactSegment;
  status: ContactStatus;
  tags: string[];
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OutreachEvent {
  id: number;
  planId: number;
  contactId: number;
  date: string;
  channel: OutreachChannel;
  templateKey: string | null;
  outcome: OutreachOutcome;
  notes: string | null;
  createdAt: Date;
}

export interface Asset {
  id: number;
  planId: number;
  title: string;
  type: string;
  url: string | null;
  linkedTaskId: number | null;
  linkedDate: string | null;
  notes: string | null;
  createdAt: Date;
}

export interface Note {
  id: number;
  planId: number;
  linkedType: 'day' | 'task' | 'kpi' | 'contact';
  linkedId: number | string;
  content: string;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Calendar Types
export interface DaySummary {
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionPercent: number;
  hasBlockedTasks: boolean;
  hasCriticalPriorityTasks: boolean;
  hasAlerts: boolean;
}

export interface CalendarData {
  planId: number;
  startDate: string;
  endDate: string;
  days: DaySummary[];
}

// KPI Status
export type KpiStatus = 'green' | 'yellow' | 'red';

export interface KpiWithStatus extends Kpi {
  latestValue: number | null;
  latestDate: string | null;
  status: KpiStatus;
  trend: 'up' | 'down' | 'stable';
}
