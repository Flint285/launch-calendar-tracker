import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kpisApi, alertsApi, KpiWithStatus, Alert } from '../services/api';
import { format } from 'date-fns';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Plus,
  X,
} from 'lucide-react';
import { useState } from 'react';

export function KpiDashboard() {
  const { id } = useParams<{ id: string }>();
  const planId = parseInt(id!);
  const queryClient = useQueryClient();

  const [showEntryForm, setShowEntryForm] = useState<number | null>(null);
  const [entryValue, setEntryValue] = useState('');
  const [entryNotes, setEntryNotes] = useState('');
  const [entryDate, setEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [showResolveForm, setShowResolveForm] = useState<number | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { data: kpisData, isLoading: kpisLoading } = useQuery({
    queryKey: ['kpis', planId],
    queryFn: () => kpisApi.list(planId),
  });

  const { data: alertsData } = useQuery({
    queryKey: ['alerts', planId],
    queryFn: () => alertsApi.list(planId, false),
  });

  const addEntryMutation = useMutation({
    mutationFn: ({ kpiId, data }: { kpiId: number; data: { date: string; value: number; notes?: string } }) =>
      kpisApi.addEntry(planId, kpiId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpis', planId] });
      queryClient.invalidateQueries({ queryKey: ['alerts', planId] });
      setShowEntryForm(null);
      setEntryValue('');
      setEntryNotes('');
    },
  });

  const resolveAlertMutation = useMutation({
    mutationFn: ({ alertId, notes }: { alertId: number; notes: string }) =>
      alertsApi.resolve(planId, alertId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts', planId] });
      setShowResolveForm(null);
      setResolutionNotes('');
    },
  });

  if (kpisLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const kpis = kpisData?.data || [];
  const alerts = alertsData?.data || [];

  const handleAddEntry = (kpiId: number) => {
    const value = parseFloat(entryValue);
    if (isNaN(value)) return;

    addEntryMutation.mutate({
      kpiId,
      data: {
        date: entryDate,
        value,
        notes: entryNotes || undefined,
      },
    });
  };

  const handleResolveAlert = (alertId: number) => {
    if (!resolutionNotes.trim()) return;
    resolveAlertMutation.mutate({ alertId, notes: resolutionNotes });
  };

  // Group KPIs by category
  const kpisByCategory = kpis.reduce((acc, kpi) => {
    const category = kpi.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(kpi);
    return acc;
  }, {} as Record<string, KpiWithStatus[]>);

  const categoryLabels: Record<string, string> = {
    email_deliverability: 'Email Deliverability',
    funnel_conversion: 'Funnel Conversion',
    revenue: 'Revenue',
    activation: 'Activation',
    ads: 'Ads',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">KPI Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your launch metrics and performance</p>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Active Alerts ({alerts.length})
          </h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                showResolveForm={showResolveForm === alert.id}
                onShowResolve={() => setShowResolveForm(alert.id)}
                onHideResolve={() => setShowResolveForm(null)}
                resolutionNotes={resolutionNotes}
                onNotesChange={setResolutionNotes}
                onResolve={() => handleResolveAlert(alert.id)}
                isResolving={resolveAlertMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {/* KPIs by Category */}
      {Object.entries(kpisByCategory).map(([category, categoryKpis]) => (
        <div key={category} className="mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">
            {categoryLabels[category] || category}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categoryKpis.map((kpi) => (
              <KpiCard
                key={kpi.id}
                kpi={kpi}
                showEntryForm={showEntryForm === kpi.id}
                onShowEntry={() => {
                  setShowEntryForm(kpi.id);
                  setEntryValue(kpi.latestValue?.toString() || '');
                }}
                onHideEntry={() => setShowEntryForm(null)}
                entryValue={entryValue}
                entryNotes={entryNotes}
                entryDate={entryDate}
                onValueChange={setEntryValue}
                onNotesChange={setEntryNotes}
                onDateChange={setEntryDate}
                onAddEntry={() => handleAddEntry(kpi.id)}
                isAdding={addEntryMutation.isPending}
              />
            ))}
          </div>
        </div>
      ))}

      {kpis.length === 0 && (
        <div className="card p-12 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No KPIs defined</h3>
          <p className="text-gray-600">
            KPIs are automatically created when you use a template to create your plan.
          </p>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  kpi,
  showEntryForm,
  onShowEntry,
  onHideEntry,
  entryValue,
  entryNotes,
  entryDate,
  onValueChange,
  onNotesChange,
  onDateChange,
  onAddEntry,
  isAdding,
}: {
  kpi: KpiWithStatus;
  showEntryForm: boolean;
  onShowEntry: () => void;
  onHideEntry: () => void;
  entryValue: string;
  entryNotes: string;
  entryDate: string;
  onValueChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onAddEntry: () => void;
  isAdding: boolean;
}) {
  const statusColors = {
    green: 'bg-green-100 text-green-700 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  };

  const trendIcon = {
    up: <TrendingUp className="h-4 w-4 text-green-500" />,
    down: <TrendingDown className="h-4 w-4 text-red-500" />,
    stable: <Minus className="h-4 w-4 text-gray-400" />,
  }[kpi.trend];

  const formatValue = (value: number | null, unit: string) => {
    if (value === null) return '—';
    switch (unit) {
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `$${value.toFixed(2)}`;
      case 'ratio':
        return value.toFixed(2);
      default:
        return value.toString();
    }
  };

  return (
    <div className={`card border ${statusColors[kpi.status]}`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-gray-900">{kpi.name}</h3>
          {trendIcon}
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-gray-900">
            {formatValue(kpi.latestValue, kpi.unit)}
          </span>
          <span className="text-sm text-gray-500">
            / {kpi.targetType === 'minimum' ? '≥' : '≤'} {formatValue(kpi.targetValue, kpi.unit)}
          </span>
        </div>

        {kpi.latestDate && (
          <p className="text-xs text-gray-500">
            Last updated: {format(new Date(kpi.latestDate), 'MMM d')}
          </p>
        )}

        {!showEntryForm ? (
          <button
            onClick={onShowEntry}
            className="mt-3 w-full btn btn-secondary text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Entry
          </button>
        ) : (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">New Entry</span>
              <button onClick={onHideEntry} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              <input
                type="date"
                value={entryDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="input text-sm"
              />
              <input
                type="number"
                step="0.01"
                value={entryValue}
                onChange={(e) => onValueChange(e.target.value)}
                placeholder={`Value (${kpi.unit})`}
                className="input text-sm"
              />
              <input
                type="text"
                value={entryNotes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Notes (optional)"
                className="input text-sm"
              />
              <button
                onClick={onAddEntry}
                disabled={isAdding || !entryValue}
                className="w-full btn btn-primary text-sm"
              >
                {isAdding ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertCard({
  alert,
  showResolveForm,
  onShowResolve,
  onHideResolve,
  resolutionNotes,
  onNotesChange,
  onResolve,
  isResolving,
}: {
  alert: Alert;
  showResolveForm: boolean;
  onShowResolve: () => void;
  onHideResolve: () => void;
  resolutionNotes: string;
  onNotesChange: (value: string) => void;
  onResolve: () => void;
  isResolving: boolean;
}) {
  const severityColors = {
    info: 'border-blue-200 bg-blue-50',
    warning: 'border-yellow-200 bg-yellow-50',
    critical: 'border-red-200 bg-red-50',
  };

  return (
    <div className={`card border ${severityColors[alert.severity as keyof typeof severityColors] || severityColors.warning}`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className={`h-5 w-5 mt-0.5 ${
                alert.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'
              }`}
            />
            <div>
              <p className="text-gray-900">{alert.message}</p>
              <p className="text-sm text-gray-500 mt-1">
                Triggered on {format(new Date(alert.dateTriggered), 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          {!showResolveForm && (
            <button onClick={onShowResolve} className="btn btn-secondary text-sm">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Resolve
            </button>
          )}
        </div>

        {showResolveForm && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Resolution Notes</span>
              <button onClick={onHideResolve} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={resolutionNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="What was changed? What is the next check date?"
              rows={3}
              className="input text-sm mb-2"
            />
            <button
              onClick={onResolve}
              disabled={isResolving || !resolutionNotes.trim()}
              className="w-full btn btn-primary text-sm"
            >
              {isResolving ? 'Resolving...' : 'Mark as Resolved'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
