import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { plansApi, CreatePlanInput } from '../services/api';
import { ArrowLeft, Calendar, Sparkles } from 'lucide-react';

export function PlanNew() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreatePlanInput>({
    name: '',
    timezone: 'America/Chicago',
    startDate: '2026-02-01',
    endDate: '2026-02-14',
    strategyTags: [],
    notes: '',
    templateId: '',
  });

  const [tagInput, setTagInput] = useState('');

  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: plansApi.templates,
  });

  const createMutation = useMutation({
    mutationFn: plansApi.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      navigate(`/plans/${response.data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.strategyTags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        strategyTags: [...(formData.strategyTags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      strategyTags: formData.strategyTags?.filter((t) => t !== tag) || [],
    });
  };

  const selectedTemplate = templates?.data.find((t) => t.id === formData.templateId);

  return (
    <div>
      <button
        onClick={() => navigate('/plans')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Plans
      </button>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Launch Plan</h1>
        <p className="text-gray-600 mb-8">
          Set up a new launch campaign with tasks, KPIs, and tracking.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Selection */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary-600" />
              Start from Template
            </h2>
            <div className="space-y-3">
              <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="template"
                  value=""
                  checked={!formData.templateId}
                  onChange={() => setFormData({ ...formData, templateId: '' })}
                  className="mt-1 mr-3"
                />
                <div>
                  <span className="font-medium text-gray-900">Blank Plan</span>
                  <p className="text-sm text-gray-600">Start from scratch with no pre-defined tasks</p>
                </div>
              </label>

              {templates?.data.map((template) => (
                <label
                  key={template.id}
                  className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="template"
                    value={template.id}
                    checked={formData.templateId === template.id}
                    onChange={() => setFormData({ ...formData, templateId: template.id })}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <span className="font-medium text-gray-900">{template.name}</span>
                    <p className="text-sm text-gray-600">{template.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {template.taskCount} tasks, {template.kpiCount} KPIs
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Plan Details</h2>

            <div>
              <label htmlFor="name" className="label">
                Plan Name *
              </label>
              <input
                id="name"
                type="text"
                required
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., February 2026 Launch"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="label">
                  Start Date *
                </label>
                <input
                  id="startDate"
                  type="date"
                  required
                  className="input"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="label">
                  End Date *
                </label>
                <input
                  id="endDate"
                  type="date"
                  required
                  className="input"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="timezone" className="label">
                Timezone
              </label>
              <select
                id="timezone"
                className="input"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              >
                <option value="America/Chicago">Central Time (Chicago)</option>
                <option value="America/New_York">Eastern Time (New York)</option>
                <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
                <option value="America/Denver">Mountain Time (Denver)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div>
              <label className="label">Strategy Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="input flex-1"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add a tag (e.g., hybrid, low-budget)"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>
              {formData.strategyTags && formData.strategyTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.strategyTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-primary-900"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="label">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                className="input"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes about this launch..."
              />
            </div>
          </div>

          {/* Summary */}
          {selectedTemplate && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-primary-800">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Template will create:</span>
              </div>
              <ul className="mt-2 text-sm text-primary-700 list-disc list-inside">
                <li>{selectedTemplate.taskCount} tasks spread across your launch dates</li>
                <li>{selectedTemplate.kpiCount} KPIs to track your performance</li>
              </ul>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/plans')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn btn-primary"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Plan'}
            </button>
          </div>

          {createMutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {createMutation.error instanceof Error
                ? createMutation.error.message
                : 'Failed to create plan'}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
