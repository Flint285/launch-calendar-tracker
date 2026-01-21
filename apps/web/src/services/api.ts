const API_BASE = '/api';

interface FetchOptions extends RequestInit {
  body?: unknown;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { body, ...fetchOptions } = options;

  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    credentials: 'include',
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) => fetchApi<T>(endpoint, { method: 'POST', body }),
  patch: <T>(endpoint: string, body: unknown) => fetchApi<T>(endpoint, { method: 'PATCH', body }),
  delete: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'DELETE' }),
};

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ data: { user: User; token: string }; success: boolean }>('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) =>
    api.post<{ data: { user: User; token: string }; success: boolean }>('/auth/register', { email, password, name }),
  logout: () => api.post<{ success: boolean }>('/auth/logout', {}),
  me: () => api.get<{ data: User; success: boolean }>('/auth/me'),
};

// Plans API
export const plansApi = {
  list: () => api.get<{ data: LaunchPlan[]; success: boolean }>('/plans'),
  get: (id: number) => api.get<{ data: LaunchPlan; success: boolean }>(`/plans/${id}`),
  create: (data: CreatePlanInput) => api.post<{ data: LaunchPlan; success: boolean }>('/plans', data),
  update: (id: number, data: Partial<LaunchPlan>) => api.patch<{ data: LaunchPlan; success: boolean }>(`/plans/${id}`, data),
  delete: (id: number) => api.delete<{ success: boolean }>(`/plans/${id}`),
  templates: () => api.get<{ data: Template[]; success: boolean }>('/plans/templates'),
  calendar: (id: number) => api.get<{ data: CalendarData; success: boolean }>(`/plans/${id}/calendar`),
  day: (id: number, date: string) => api.get<{ data: DayData; success: boolean }>(`/plans/${id}/day/${date}`),
};

// Tasks API
export const tasksApi = {
  list: (planId: number, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<{ data: Task[]; success: boolean }>(`/plans/${planId}/tasks${query}`);
  },
  create: (planId: number, data: CreateTaskInput) =>
    api.post<{ data: Task; success: boolean }>(`/plans/${planId}/tasks`, data),
  update: (planId: number, taskId: number, data: Partial<Task>) =>
    api.patch<{ data: Task; success: boolean }>(`/plans/${planId}/tasks/${taskId}`, data),
  complete: (planId: number, taskId: number, completionNotes?: string) =>
    api.post<{ data: Task; success: boolean }>(`/plans/${planId}/tasks/${taskId}/complete`, { completionNotes }),
  delete: (planId: number, taskId: number) =>
    api.delete<{ success: boolean }>(`/plans/${planId}/tasks/${taskId}`),
};

// KPIs API
export const kpisApi = {
  list: (planId: number) => api.get<{ data: KpiWithStatus[]; success: boolean }>(`/plans/${planId}/kpis`),
  create: (planId: number, data: CreateKpiInput) =>
    api.post<{ data: Kpi; success: boolean }>(`/plans/${planId}/kpis`, data),
  addEntry: (planId: number, kpiId: number, data: CreateKpiEntryInput) =>
    api.post<{ data: KpiEntry; success: boolean }>(`/plans/${planId}/kpis/${kpiId}/entries`, data),
  getEntries: (planId: number, kpiId: number) =>
    api.get<{ data: KpiEntry[]; success: boolean }>(`/plans/${planId}/kpis/${kpiId}/entries`),
};

// Alerts API
export const alertsApi = {
  list: (planId: number, resolved?: boolean) => {
    const query = resolved !== undefined ? `?resolved=${resolved}` : '';
    return api.get<{ data: Alert[]; success: boolean }>(`/plans/${planId}/alerts${query}`);
  },
  resolve: (planId: number, alertId: number, resolutionNotes: string) =>
    api.post<{ data: Alert; success: boolean }>(`/plans/${planId}/alerts/${alertId}/resolve`, { resolutionNotes }),
};

// Report API
export const reportApi = {
  get: (planId: number) => api.get<{ data: ReportData; success: boolean }>(`/plans/${planId}/report`),
  exportCsv: (planId: number) => `/api/plans/${planId}/export/csv`,
};

// Types
interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface LaunchPlan {
  id: number;
  userId: number;
  name: string;
  timezone: string;
  startDate: string;
  endDate: string;
  strategyTags: string[];
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface CreatePlanInput {
  name: string;
  timezone?: string;
  startDate: string;
  endDate: string;
  strategyTags?: string[];
  notes?: string;
  templateId?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  taskCount: number;
  kpiCount: number;
}

interface CalendarData {
  planId: number;
  startDate: string;
  endDate: string;
  days: DaySummary[];
}

interface DaySummary {
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionPercent: number;
  hasBlockedTasks: boolean;
  hasCriticalPriorityTasks: boolean;
  hasAlerts: boolean;
}

interface DayData {
  date: string;
  tasks: Task[];
  grouped: {
    mustDo: Task[];
    shouldDo: Task[];
    optional: Task[];
  };
  summary: {
    total: number;
    completed: number;
    blocked: number;
  };
}

interface Task {
  id: number;
  planId: number;
  title: string;
  description: string | null;
  dueDate: string;
  dueTime: string | null;
  estimatedMinutes: number | null;
  status: string;
  priority: string;
  category: string;
  ownerId: number | null;
  links: string[];
  completionNotes: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  estimatedMinutes?: number;
  status?: string;
  priority?: string;
  category?: string;
  ownerId?: number;
  links?: string[];
  dependsOn?: number[];
}

interface Kpi {
  id: number;
  planId: number;
  name: string;
  category: string;
  unit: string;
  targetType: string;
  targetValue: number;
  calculationType: string;
  createdAt: string;
}

interface KpiWithStatus extends Kpi {
  latestValue: number | null;
  latestDate: string | null;
  status: 'green' | 'yellow' | 'red';
  trend: 'up' | 'down' | 'stable';
  entries: KpiEntry[];
}

interface KpiEntry {
  id: number;
  planId: number;
  kpiId: number;
  date: string;
  value: number;
  notes: string | null;
  createdAt: string;
}

interface CreateKpiInput {
  name: string;
  category: string;
  unit: string;
  targetType: string;
  targetValue: number;
}

interface CreateKpiEntryInput {
  date: string;
  value: number;
  notes?: string;
}

interface Alert {
  id: number;
  planId: number;
  kpiId: number | null;
  dateTriggered: string;
  severity: string;
  message: string;
  resolvedAt: string | null;
  resolutionNotes: string | null;
  createdAt: string;
}

interface ReportData {
  plan: LaunchPlan;
  taskSummary: {
    total: number;
    completed: number;
    skipped: number;
    blocked: number;
  };
  kpis: Array<{
    name: string;
    category: string;
    unit: string;
    targetType: string;
    targetValue: number;
    finalValue: number | null;
  }>;
  outreachFunnel: Array<{
    segment: string;
    total: number;
    contacted: number;
    replied: number;
    converted: number;
  }>;
  learnings: Array<{
    id: number;
    content: string;
    createdAt: string;
  }>;
}

export type {
  User,
  LaunchPlan,
  CreatePlanInput,
  Template,
  CalendarData,
  DaySummary,
  DayData,
  Task,
  CreateTaskInput,
  Kpi,
  KpiWithStatus,
  KpiEntry,
  CreateKpiInput,
  CreateKpiEntryInput,
  Alert,
  ReportData,
};
