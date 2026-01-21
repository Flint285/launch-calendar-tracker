import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { plansApi, LaunchPlan } from '../services/api';
import { Plus, Calendar, ArrowRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function Plans() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['plans'],
    queryFn: plansApi.list,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        Failed to load plans. Please try again.
      </div>
    );
  }

  const plans = data?.data || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Launch Plans</h1>
          <p className="text-gray-600 mt-1">Manage your product launch campaigns</p>
        </div>
        <Link to="/plans/new" className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No launch plans yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first launch plan to start tracking your campaign.
          </p>
          <Link to="/plans/new" className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Plan
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan }: { plan: LaunchPlan }) {
  const startDate = parseISO(plan.startDate);
  const endDate = parseISO(plan.endDate);
  const today = new Date();
  const isActive = today >= startDate && today <= endDate;
  const isPast = today > endDate;
  const isFuture = today < startDate;

  return (
    <Link to={`/plans/${plan.id}`} className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-gray-900">{plan.name}</h3>
        <StatusBadge isActive={isActive} isPast={isPast} isFuture={isFuture} status={plan.status} />
      </div>

      <div className="text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      {plan.strategyTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
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

      <div className="flex items-center text-primary-600 text-sm font-medium">
        View Plan
        <ArrowRight className="h-4 w-4 ml-1" />
      </div>
    </Link>
  );
}

function StatusBadge({
  isActive,
  isPast,
  isFuture,
  status,
}: {
  isActive: boolean;
  isPast: boolean;
  isFuture: boolean;
  status: string;
}) {
  if (status === 'completed') {
    return (
      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
        Completed
      </span>
    );
  }

  if (isActive) {
    return (
      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
        Active
      </span>
    );
  }

  if (isPast) {
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
        Ended
      </span>
    );
  }

  if (isFuture) {
    return (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
        Upcoming
      </span>
    );
  }

  return null;
}
