import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalAPI } from '@/lib/api';
import { Goal, GoalFormData } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { Target, Plus, Edit, Trash2, CheckCircle, Calendar, TrendingUp, X } from 'lucide-react';
import toast from 'react-hot-toast';

const GoalsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['goals', filter],
    queryFn: async () => {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await goalAPI.getGoals(params);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: GoalFormData) => goalAPI.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal created successfully!');
      setIsModalOpen(false);
    },
    onError: () => toast.error('Failed to create goal'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GoalFormData> }) =>
      goalAPI.updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal updated successfully!');
      setIsModalOpen(false);
      setEditingGoal(null);
    },
    onError: () => toast.error('Failed to update goal'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => goalAPI.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal deleted successfully!');
    },
    onError: () => toast.error('Failed to delete goal'),
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, currentValue }: { id: string; currentValue: number }) =>
      goalAPI.updateGoalProgress(id, currentValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Progress updated!');
    },
    onError: () => toast.error('Failed to update progress'),
  });

  const goals = (data as any)?.goals || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Goals</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your fitness goals and progress</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      <div className="flex space-x-2">
        {['all', 'active', 'completed', 'overdue'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12 card">
          <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No goals yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Start tracking your fitness goals</p>
          <Button onClick={() => setIsModalOpen(true)}>Create Your First Goal</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal: Goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onEdit={() => {
                setEditingGoal(goal);
                setIsModalOpen(true);
              }}
              onDelete={() => deleteMutation.mutate(goal._id)}
              onUpdateProgress={(value) =>
                updateProgressMutation.mutate({ id: goal._id, currentValue: value })
              }
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <GoalModal
          goal={editingGoal}
          onClose={() => {
            setIsModalOpen(false);
            setEditingGoal(null);
          }}
          onSubmit={(data) => {
            if (editingGoal) {
              updateMutation.mutate({ id: editingGoal._id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
        />
      )}
    </div>
  );
};

interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateProgress: (value: number) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete, onUpdateProgress }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newValue, setNewValue] = useState(goal.currentValue);

  const progressPercentage = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  const daysRemaining = Math.ceil(
    (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
          {goal.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button onClick={onEdit} className="text-gray-400 hover:text-primary-600">
            <Edit className="h-4 w-4" />
          </button>
          <button onClick={onDelete} className="text-gray-400 hover:text-error-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {goal.currentValue} / {goal.targetValue} {goal.unit}
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              goal.isCompleted
                ? 'bg-success-600'
                : daysRemaining < 0
                ? 'bg-error-600'
                : 'bg-primary-600'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4 mr-1" />
            {daysRemaining >= 0 ? `${daysRemaining} days left` : 'Overdue'}
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            {Math.round(progressPercentage)}%
          </span>
        </div>

        {goal.isCompleted ? (
          <div className="flex items-center text-success-600 text-sm font-medium">
            <CheckCircle className="h-4 w-4 mr-1" />
            Completed!
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            {isUpdating ? (
              <>
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                  min="0"
                  max={goal.targetValue}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    onUpdateProgress(newValue);
                    setIsUpdating(false);
                  }}
                >
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsUpdating(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setIsUpdating(true)} className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                Update Progress
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface GoalModalProps {
  goal: Goal | null;
  onClose: () => void;
  onSubmit: (data: GoalFormData) => void;
}

const GoalModal: React.FC<GoalModalProps> = ({ goal, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<GoalFormData>({
    title: goal?.title || '',
    description: goal?.description || '',
    type: goal?.type || 'custom',
    targetValue: goal?.targetValue || 0,
    unit: goal?.unit || 'kg',
    targetDate: goal?.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {goal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="weight_loss">Weight Loss</option>
              <option value="weight_gain">Weight Gain</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="endurance">Endurance</option>
              <option value="strength">Strength</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Value
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
                <option value="minutes">minutes</option>
                <option value="hours">hours</option>
                <option value="reps">reps</option>
                <option value="sets">sets</option>
                <option value="km">km</option>
                <option value="miles">miles</option>
                <option value="calories">calories</option>
                <option value="days">days</option>
                <option value="weeks">weeks</option>
                <option value="months">months</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Date
            </label>
            <input
              type="date"
              required
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              {goal ? 'Update Goal' : 'Create Goal'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalsPage;
