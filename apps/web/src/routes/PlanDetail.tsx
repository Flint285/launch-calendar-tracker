import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { plansApi, tasksApi, kpisApi, alertsApi } from '../services/api';
import { format, parseISO, differenceInDays } from 'date-fns';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  ArrowRight,
  Target,
} from 'lucide-react';

export function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const planId = parseInt(id!);

  const { data: planData, isLoading: planLoading } = useQuery({
    queryKey: ['plan', planId],
    queryFn: () => plansApi.get(planId),
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', planId],
    queryFn: () => tasksApi.list(planId),
  });

  const { data: kpisData } = useQuery({
    queryKey: ['kpis', planId],
    queryFn: () => kpisApi.list(planId),
  });

  const { data: alertsData } = useQuery({
    queryKey: ['alerts', planId],
    queryFn: () => alertsApi.list(planId, false),
  });

  if (planLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const plan = planData?.data;
  const tasks = tasksData?.data || [];
  const kpis = kpisData?.data || [];
  const alerts = alertsData?.data || [];

  if (!plan) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        Plan not found
      </div>
    );
  }

  const startDate = parseISO(plan.startDate);
  const endDate = parseISO(plan.endDate);
  const today = new Date();
  const totalDays = differenceInDays(endDate, startDate) + 1;
  const daysPassed = Math.max(0, Math.min(differenceInDays(today, startDate) + 1, totalDays));
  const progressPercent = Math.round((daysPassed / totalDays) * 100);

  const completedTasks = tasks.filter((t) => t.status === 'complete').length;
  const totalTasks = tasks.length;
  const taskCompletionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const todayStr = format(today, 'yyyy-MM-dd');
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const todayCompleted = todayTasks.filter((t) => t.status === 'complete').length;

  const kpisAtRisk = kpis.filter((k) => k.status === 'red' || k.status === 'yellow');

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{plan.name}</h1>
        <div className="flex items-center gap-4 mt-2 text-gray-600">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
          </span>
          <span>•</span>
          <span>{totalDays} days</span>
        </div>
        {plan.strategyTags.length > 0 && (
          <div className="flex gap-2 mt-3">
            {plan.strategyTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="card p-6 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Launch Progress</span>
          <span className="text-sm text-gray-600">
            Day {daysPassed} of {totalDays} ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-primary-600 h-2.5 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-yellow-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}
          </h3>
          <ul className="mt-2 space-y-1">
            {alerts.slice(0, 3).map((alert) => (
              <li key={alert.id} className="text-sm text-yellow-700">
                • {alert.message}
              </li>
            ))}
          </ul>
          {alerts.length > 3 && (
            <Link to={`/plans/${planId}/kpis`} className="text-sm text-yellow-800 underline mt-2 inline-block">
              View all alerts
            </Link>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          label="Tasks Completed"
          value={`${completedTasks}/${totalTasks}`}
          subtext={`${taskCompletionPercent}% complete`}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-blue-600" />}
          label="Today's Tasks"
          value={`${todayCompleted}/${todayTasks.length}`}
          subtext={todayTasks.length === 0 ? 'No tasks today' : 'remaining'}
        />
        <StatCard
          icon={<Target className="h-5 w-5 text-purple-600" />}
          label="KPIs Tracked"
          value={kpis.length.toString()}
          subtext={kpisAtRisk.length > 0 ? `${kpisAtRisk.length} at risk` : 'All healthy'}
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-yellow-600" />}
          label="Active Alerts"
          value={alerts.length.toString()}
          subtext={alerts.length > 0 ? 'Need attention' : 'All clear'}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <QuickActionCard
          title="Today's Checklist"
          description={`${todayTasks.length} tasks scheduled for today`}
          link={`/plans/${planId}/day/${todayStr}`}
          icon={<CheckCircle2 className="h-6 w-6" />}
        />
        <QuickActionCard
          title="View Calendar"
          description="See all tasks across the launch window"
          link={`/plans/${planId}/calendar`}
          icon={<Calendar className="h-6 w-6" />}
        />
        <QuickActionCard
          title="KPI Dashboard"
          description="Track metrics and enter daily values"
          link={`/plans/${planId}/kpis`}
          icon={<BarChart3 className="h-6 w-6" />}
        />
      </div>

      {/* Today's High Priority Tasks */}
      {todayTasks.length > 0 && (
        <div className="card">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Today's Priority Tasks</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {todayTasks
              .filter((t) => t.priority === 'high')
              .slice(0, 5)
              .map((task) => (
                <div key={task.id} className="p-4 flex items-center gap-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      task.status === 'complete'
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300'
                    }`}
                  />
                  <div className="flex-1">
                    <span
                      className={`${
                        task.status === 'complete' ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.estimatedMinutes && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({task.estimatedMinutes}m)
                      </span>
                    )}
                  </div>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                    High
                  </span>
                </div>
              ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <Link
              to={`/plans/${planId}/day/${todayStr}`}
              className="text-primary-600 text-sm font-medium flex items-center"
            >
              View all today's tasks
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-xs text-gray-500">{subtext}</p>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  link,
  icon,
}: {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
}) {
  return (
    <Link to={link} className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary-50 text-primary-600 rounded-lg">{icon}</div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
}
