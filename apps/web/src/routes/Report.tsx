import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../services/api';
import { format, parseISO } from 'date-fns';
import {
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
} from 'lucide-react';

export function Report() {
  const { id } = useParams<{ id: string }>();
  const planId = parseInt(id!);

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['report', planId],
    queryFn: () => reportApi.get(planId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const report = reportData?.data;
  if (!report) {
    return <div>Failed to load report</div>;
  }

  const { plan, taskSummary, kpis, outreachFunnel, learnings } = report;
  const completionRate = taskSummary.total > 0
    ? Math.round((taskSummary.completed / taskSummary.total) * 100)
    : 0;

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Launch Report</h1>
          <p className="text-gray-600 mt-1">
            {plan.name} • {format(parseISO(plan.startDate), 'MMM d')} -{' '}
            {format(parseISO(plan.endDate), 'MMM d, yyyy')}
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href={reportApi.exportCsv(planId)}
            download
            className="btn btn-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </a>
        </div>
      </div>

      {/* Task Summary */}
      <div className="card mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Task Completion Summary
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{taskSummary.total}</p>
              <p className="text-sm text-gray-600">Total Tasks</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{taskSummary.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-500">{taskSummary.skipped}</p>
              <p className="text-sm text-gray-600">Skipped</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{taskSummary.blocked}</p>
              <p className="text-sm text-gray-600">Blocked</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Completion Rate</span>
              <span className="text-gray-600">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Results */}
      <div className="card mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            KPI Final Values
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  KPI
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Target
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Final Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {kpis.map((kpi, index) => {
                const hitTarget = kpi.finalValue !== null && (
                  kpi.targetType === 'minimum'
                    ? kpi.finalValue >= kpi.targetValue
                    : kpi.finalValue <= kpi.targetValue
                );

                const formatValue = (value: number | null) => {
                  if (value === null) return '—';
                  switch (kpi.unit) {
                    case 'percent':
                      return `${value.toFixed(1)}%`;
                    case 'currency':
                      return `$${value.toFixed(2)}`;
                    default:
                      return value.toString();
                  }
                };

                return (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">{kpi.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{kpi.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {kpi.targetType === 'minimum' ? '≥' : '≤'} {formatValue(kpi.targetValue)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatValue(kpi.finalValue)}
                    </td>
                    <td className="px-4 py-3">
                      {kpi.finalValue === null ? (
                        <span className="text-gray-400">No data</span>
                      ) : hitTarget ? (
                        <span className="inline-flex items-center text-green-600">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Met
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-600">
                          <XCircle className="h-4 w-4 mr-1" />
                          Missed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outreach Funnel */}
      {outreachFunnel.length > 0 && (
        <div className="card mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Outreach Funnel by Segment
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Segment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Contacts
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contacted
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Replied
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Converted
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Conversion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {outreachFunnel.map((segment) => {
                  const conversionRate = segment.contacted > 0
                    ? ((segment.converted / segment.contacted) * 100).toFixed(1)
                    : '0.0';

                  return (
                    <tr key={segment.segment}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">
                        {segment.segment.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{segment.total}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{segment.contacted}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{segment.replied}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">
                        {segment.converted}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{conversionRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Learnings */}
      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-500" />
            Learnings & Notes
          </h2>
        </div>
        <div className="p-4">
          {learnings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No learnings recorded yet. Add notes during your launch to capture key insights.
            </p>
          ) : (
            <div className="space-y-4">
              {learnings.map((learning) => (
                <div key={learning.id} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{learning.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {format(new Date(learning.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
