import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { plansApi } from '../services/api';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, AlertCircle, Clock } from 'lucide-react';
import { useState } from 'react';

export function Calendar() {
  const { id } = useParams<{ id: string }>();
  const planId = parseInt(id!);
  const navigate = useNavigate();

  const { data: calendarData, isLoading } = useQuery({
    queryKey: ['calendar', planId],
    queryFn: () => plansApi.calendar(planId),
  });

  const { data: planData } = useQuery({
    queryKey: ['plan', planId],
    queryFn: () => plansApi.get(planId),
  });

  const plan = planData?.data;
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (plan) {
      return parseISO(plan.startDate);
    }
    return new Date();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const calendar = calendarData?.data;
  if (!calendar || !plan) {
    return <div>Failed to load calendar</div>;
  }

  const dayDataMap = new Map(calendar.days.map((d) => [d.date, d]));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get padding days for the start of the month
  const startPadding = monthStart.getDay();
  const paddingDays = Array(startPadding).fill(null);

  const planStartDate = parseISO(plan.startDate);
  const planEndDate = parseISO(plan.endDate);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    navigate(`/plans/${planId}/day/${dateStr}`);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Launch Calendar</h1>
        <p className="text-gray-600 mt-1">
          {format(planStartDate, 'MMM d')} - {format(planEndDate, 'MMM d, yyyy')}
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-gray-600">100% complete</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500"></div>
          <span className="text-gray-600">In progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-200"></div>
          <span className="text-gray-600">Not started</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-gray-600">Has alerts</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="card">
        {/* Month navigation */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {/* Padding days */}
          {paddingDays.map((_, index) => (
            <div key={`pad-${index}`} className="p-3 min-h-[100px] bg-gray-50"></div>
          ))}

          {/* Actual days */}
          {days.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayData = dayDataMap.get(dateStr);
            const isInLaunchWindow = date >= planStartDate && date <= planEndDate;
            const today = isToday(date);

            return (
              <div
                key={dateStr}
                onClick={() => isInLaunchWindow && handleDayClick(date)}
                className={`p-3 min-h-[100px] border-b border-r border-gray-100 ${
                  isInLaunchWindow
                    ? 'cursor-pointer hover:bg-gray-50'
                    : 'bg-gray-50 opacity-50'
                } ${today ? 'ring-2 ring-inset ring-primary-500' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`text-sm font-medium ${
                      today
                        ? 'bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center'
                        : 'text-gray-900'
                    }`}
                  >
                    {format(date, 'd')}
                  </span>
                  {dayData?.hasAlerts && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>

                {dayData && dayData.totalTasks > 0 && (
                  <div className="mt-2">
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                      <div
                        className={`h-1.5 rounded-full ${
                          dayData.completionPercent === 100
                            ? 'bg-green-500'
                            : dayData.completionPercent > 0
                            ? 'bg-yellow-500'
                            : 'bg-gray-200'
                        }`}
                        style={{ width: `${dayData.completionPercent}%` }}
                      ></div>
                    </div>

                    {/* Task count */}
                    <div className="text-xs text-gray-600">
                      {dayData.completedTasks}/{dayData.totalTasks} tasks
                    </div>

                    {/* Indicators */}
                    <div className="flex gap-1 mt-1">
                      {dayData.hasBlockedTasks && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                          Blocked
                        </span>
                      )}
                      {dayData.hasCriticalPriorityTasks && (
                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                          Critical
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
