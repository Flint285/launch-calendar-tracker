import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansApi, tasksApi, Task } from '../services/api';
import { format, parseISO, addDays, subDays } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Pause,
  SkipForward,
} from 'lucide-react';
import { useState } from 'react';

export function DayView() {
  const { id, date } = useParams<{ id: string; date: string }>();
  const planId = parseInt(id!);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: dayData, isLoading } = useQuery({
    queryKey: ['day', planId, date],
    queryFn: () => plansApi.day(planId, date!),
  });

  const { data: planData } = useQuery({
    queryKey: ['plan', planId],
    queryFn: () => plansApi.get(planId),
  });

  const completeMutation = useMutation({
    mutationFn: ({ taskId }: { taskId: number }) =>
      tasksApi.complete(planId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['day', planId, date] });
      queryClient.invalidateQueries({ queryKey: ['calendar', planId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', planId] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: string }) =>
      tasksApi.update(planId, taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['day', planId, date] });
      queryClient.invalidateQueries({ queryKey: ['calendar', planId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const plan = planData?.data;
  const day = dayData?.data;

  if (!day || !plan || !date) {
    return <div>Failed to load day</div>;
  }

  const currentDate = parseISO(date);
  const planStartDate = parseISO(plan.startDate);
  const planEndDate = parseISO(plan.endDate);

  const prevDate = subDays(currentDate, 1);
  const nextDate = addDays(currentDate, 1);
  const canGoPrev = prevDate >= planStartDate;
  const canGoNext = nextDate <= planEndDate;

  const handleToggleComplete = (task: Task) => {
    if (task.status === 'complete') {
      updateStatusMutation.mutate({ taskId: task.id, status: 'not_started' });
    } else {
      completeMutation.mutate({ taskId: task.id });
    }
  };

  const handleSetStatus = (taskId: number, status: string) => {
    updateStatusMutation.mutate({ taskId, status });
  };

  return (
    <div>
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h1>
          <p className="text-gray-600 mt-1">
            {day.summary.completed} of {day.summary.total} tasks completed
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => canGoPrev && navigate(`/plans/${planId}/day/${format(prevDate, 'yyyy-MM-dd')}`)}
            disabled={!canGoPrev}
            className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <Link
            to={`/plans/${planId}/calendar`}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Calendar
          </Link>
          <button
            onClick={() => canGoNext && navigate(`/plans/${planId}/day/${format(nextDate, 'yyyy-MM-dd')}`)}
            disabled={!canGoNext}
            className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card p-4 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">Today's Progress</span>
          <span className="text-gray-600">
            {day.summary.total > 0
              ? Math.round((day.summary.completed / day.summary.total) * 100)
              : 0}
            %
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{
              width: `${
                day.summary.total > 0
                  ? (day.summary.completed / day.summary.total) * 100
                  : 0
              }%`,
            }}
          ></div>
        </div>
      </div>

      {/* Task lists by priority */}
      {day.tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks scheduled</h3>
          <p className="text-gray-600">This day has no tasks assigned.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Must Do (High Priority) */}
          {day.grouped.mustDo.length > 0 && (
            <TaskSection
              title="Must Do Tonight"
              subtitle="High priority tasks"
              tasks={day.grouped.mustDo}
              onToggleComplete={handleToggleComplete}
              onSetStatus={handleSetStatus}
              accentColor="red"
            />
          )}

          {/* Should Do (Medium Priority) */}
          {day.grouped.shouldDo.length > 0 && (
            <TaskSection
              title="Should Do"
              subtitle="Medium priority tasks"
              tasks={day.grouped.shouldDo}
              onToggleComplete={handleToggleComplete}
              onSetStatus={handleSetStatus}
              accentColor="yellow"
            />
          )}

          {/* Optional (Low Priority) */}
          {day.grouped.optional.length > 0 && (
            <TaskSection
              title="Optional"
              subtitle="Low priority tasks"
              tasks={day.grouped.optional}
              onToggleComplete={handleToggleComplete}
              onSetStatus={handleSetStatus}
              accentColor="gray"
            />
          )}
        </div>
      )}
    </div>
  );
}

function TaskSection({
  title,
  subtitle,
  tasks,
  onToggleComplete,
  onSetStatus,
  accentColor,
}: {
  title: string;
  subtitle: string;
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onSetStatus: (taskId: number, status: string) => void;
  accentColor: 'red' | 'yellow' | 'gray';
}) {
  const borderColor = {
    red: 'border-l-red-500',
    yellow: 'border-l-yellow-500',
    gray: 'border-l-gray-400',
  }[accentColor];

  return (
    <div className={`card border-l-4 ${borderColor}`}>
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
      <div className="divide-y divide-gray-100">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onSetStatus={onSetStatus}
          />
        ))}
      </div>
    </div>
  );
}

function TaskItem({
  task,
  onToggleComplete,
  onSetStatus,
}: {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onSetStatus: (taskId: number, status: string) => void;
}) {
  const [showActions, setShowActions] = useState(false);

  const statusIcon = {
    not_started: <Circle className="h-5 w-5 text-gray-400" />,
    in_progress: <Clock className="h-5 w-5 text-blue-500" />,
    complete: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    blocked: <AlertTriangle className="h-5 w-5 text-red-500" />,
    skipped: <SkipForward className="h-5 w-5 text-gray-400" />,
  }[task.status] || <Circle className="h-5 w-5 text-gray-400" />;

  const categoryColors: Record<string, string> = {
    product: 'bg-purple-100 text-purple-700',
    funnel: 'bg-blue-100 text-blue-700',
    outreach: 'bg-green-100 text-green-700',
    email: 'bg-yellow-100 text-yellow-700',
    ads: 'bg-orange-100 text-orange-700',
    analytics: 'bg-indigo-100 text-indigo-700',
    support: 'bg-pink-100 text-pink-700',
    other: 'bg-gray-100 text-gray-700',
  };

  return (
    <div
      className={`p-4 ${task.status === 'complete' || task.status === 'skipped' ? 'opacity-60' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={() => onToggleComplete(task)}
          className="mt-0.5 hover:scale-110 transition-transform"
        >
          {statusIcon}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-medium ${
                task.status === 'complete' ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {task.title}
            </span>
            <span className={`px-2 py-0.5 text-xs rounded ${categoryColors[task.category] || categoryColors.other}`}>
              {task.category}
            </span>
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {task.estimatedMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.estimatedMinutes}m
              </span>
            )}
            {task.status === 'blocked' && (
              <span className="text-red-600 font-medium">Blocked</span>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className={`flex items-center gap-1 ${showActions ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
          {task.status !== 'in_progress' && task.status !== 'complete' && (
            <button
              onClick={() => onSetStatus(task.id, 'in_progress')}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Mark as in progress"
            >
              <Clock className="h-4 w-4" />
            </button>
          )}
          {task.status !== 'blocked' && task.status !== 'complete' && (
            <button
              onClick={() => onSetStatus(task.id, 'blocked')}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
              title="Mark as blocked"
            >
              <Pause className="h-4 w-4" />
            </button>
          )}
          {task.status !== 'skipped' && task.status !== 'complete' && (
            <button
              onClick={() => onSetStatus(task.id, 'skipped')}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Skip task"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
