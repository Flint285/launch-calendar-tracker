import type { KpiStatus, KpiTargetType, Kpi } from '../types/index.js';

/**
 * Calculate KPI status based on current value vs target
 */
export function calculateKpiStatus(
  value: number,
  targetValue: number,
  targetType: KpiTargetType,
  warningThreshold = 0.1 // 10% from target triggers yellow
): KpiStatus {
  if (targetType === 'minimum') {
    // For minimum targets (e.g., opt-in rate >= 30%)
    // Green if value >= target
    // Yellow if value is within warning threshold of target
    // Red if value is below warning threshold
    if (value >= targetValue) return 'green';
    const threshold = targetValue * (1 - warningThreshold);
    if (value >= threshold) return 'yellow';
    return 'red';
  } else {
    // For maximum targets (e.g., spam rate <= 0.1%)
    // Green if value <= target
    // Yellow if value is within warning threshold of target
    // Red if value exceeds warning threshold
    if (value <= targetValue) return 'green';
    const threshold = targetValue * (1 + warningThreshold);
    if (value <= threshold) return 'yellow';
    return 'red';
  }
}

/**
 * Calculate trend from array of values (most recent last)
 */
export function calculateTrend(
  values: number[],
  minDataPoints = 2
): 'up' | 'down' | 'stable' {
  if (values.length < minDataPoints) return 'stable';

  const recent = values.slice(-3); // Look at last 3 data points
  if (recent.length < 2) return 'stable';

  const first = recent[0];
  const last = recent[recent.length - 1];
  const changePercent = ((last - first) / Math.abs(first || 1)) * 100;

  if (changePercent > 5) return 'up';
  if (changePercent < -5) return 'down';
  return 'stable';
}

/**
 * Format date string to display format
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', options ?? {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format date for display with day of week
 */
export function formatDateWithDay(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get all dates in a range (inclusive)
 */
export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Add days to a date string
 */
export function addDays(dateString: string, days: number): string {
  const date = new Date(dateString + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Check if date is within range
 */
export function isDateInRange(date: string, startDate: string, endDate: string): boolean {
  return date >= startDate && date <= endDate;
}

/**
 * Calculate completion percentage
 */
export function calculateCompletionPercent(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Format minutes to human readable duration
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format KPI value based on unit
 */
export function formatKpiValue(value: number, unit: string): string {
  switch (unit) {
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'currency':
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'ratio':
      return value.toFixed(2);
    case 'count':
    default:
      return value.toLocaleString('en-US');
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Parse CSV string to array of objects
 */
export function parseCSV<T extends Record<string, string>>(
  csvString: string,
  requiredHeaders: string[]
): { data: T[]; errors: string[] } {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) {
    return { data: [], errors: ['CSV must have at least a header row and one data row'] };
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const errors: string[] = [];

  // Check required headers
  for (const required of requiredHeaders) {
    if (!headers.includes(required.toLowerCase())) {
      errors.push(`Missing required column: ${required}`);
    }
  }

  if (errors.length > 0) {
    return { data: [], errors };
  }

  const data: T[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) {
      errors.push(`Row ${i + 1}: Column count mismatch`);
      continue;
    }

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    data.push(row as T);
  }

  return { data, errors };
}
