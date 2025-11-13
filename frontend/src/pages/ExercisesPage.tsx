import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseAPI } from '@/lib/api';
import { Exercise, ExerciseFormData } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { Activity, Plus, Search, X, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ExercisesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['exercises', searchTerm, category, difficulty],
    queryFn: async () => {
      try {
        const params: any = { includeCustom: true, limit: 100 };
        if (searchTerm) params.search = searchTerm;
        if (category) params.category = category;
        if (difficulty) params.difficulty = difficulty;
        const response = await exerciseAPI.getExercises(params);
        return response.data;
      } catch (error) {
        console.error('Error fetching exercises:', error);
        // Return empty array on error instead of throwing
        return { exercises: [] };
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => exerciseAPI.deleteExercise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast.success('Exercise deleted!');
    },
    onError: () => toast.error('Failed to delete exercise'),
  });

  const exercises = (data as any)?.exercises || [];
  
  // Filter exercises by difficulty if specified
  const filteredExercises = difficulty 
    ? exercises.filter((ex: Exercise) => ex.difficulty === difficulty)
    : exercises;

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exercise Library</h1>
          <p className="text-gray-600 dark:text-gray-400">Browse and manage exercises</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Exercise
        </Button>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Categories</option>
            <option value="strength">Strength</option>
            <option value="cardio">Cardio</option>
            <option value="flexibility">Flexibility</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center py-12 card">
          <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No exercises found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || category || difficulty 
              ? 'Try adjusting your filters or search term' 
              : 'Create your first custom exercise to get started'}
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Custom Exercise
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise: Exercise) => (
            <ExerciseCard
              key={exercise._id}
              exercise={exercise}
              onEdit={() => {
                setEditingExercise(exercise);
                setIsModalOpen(true);
              }}
              onDelete={() => deleteMutation.mutate(exercise._id)}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <ExerciseModal
          exercise={editingExercise}
          onClose={() => {
            setIsModalOpen(false);
            setEditingExercise(null);
          }}
        />
      )}
    </div>
  );
};

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit: () => void;
  onDelete: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onEdit, onDelete }) => {
  const difficultyColors = {
    beginner: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300',
    intermediate: 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300',
    advanced: 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300',
  };

  const categoryColors = {
    strength: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
    cardio: 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300',
    flexibility: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300',
    sports: 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300',
    other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">{exercise.name}</h3>
        {exercise.isCustom && (
          <div className="flex space-x-1">
            <button onClick={onEdit} className="text-gray-400 hover:text-primary-600">
              <Edit className="h-4 w-4" />
            </button>
            <button onClick={onDelete} className="text-gray-400 hover:text-error-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 text-xs rounded ${categoryColors[exercise.category]}`}>
          {exercise.category}
        </span>
        <span className={`px-2 py-1 text-xs rounded ${difficultyColors[exercise.difficulty]}`}>
          {exercise.difficulty}
        </span>
        {exercise.isCustom && (
          <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
            Custom
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Muscle Groups</p>
          <div className="flex flex-wrap gap-1">
            {exercise.muscleGroups.map((muscle, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
              >
                {muscle.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        {exercise.equipment && exercise.equipment.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Equipment</p>
            <div className="flex flex-wrap gap-1">
              {exercise.equipment.map((equip, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                >
                  {equip.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {exercise.instructions && (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Instructions</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {exercise.instructions}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface ExerciseModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({ exercise, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ExerciseFormData>({
    name: exercise?.name || '',
    category: exercise?.category || 'strength',
    muscleGroups: exercise?.muscleGroups || [],
    equipment: exercise?.equipment || [],
    instructions: exercise?.instructions || '',
    difficulty: exercise?.difficulty || 'beginner',
  });

  const createMutation = useMutation({
    mutationFn: (data: ExerciseFormData) => exerciseAPI.createExercise(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast.success('Exercise created!');
      onClose();
    },
    onError: () => toast.error('Failed to create exercise'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: ExerciseFormData) => exerciseAPI.updateExercise(exercise!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast.success('Exercise updated!');
      onClose();
    },
    onError: () => toast.error('Failed to update exercise'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (exercise) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const muscleGroupOptions = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'abs', 'obliques', 'lower_back', 'quadriceps', 'hamstrings',
    'glutes', 'calves', 'full_body', 'cardio'
  ];

  const equipmentOptions = [
    'bodyweight', 'dumbbells', 'barbell', 'kettlebell', 'resistance_bands',
    'pull_up_bar', 'bench', 'cable_machine', 'treadmill', 'stationary_bike',
    'rowing_machine', 'elliptical', 'medicine_ball', 'foam_roller', 'other'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {exercise ? 'Edit Exercise' : 'Create Custom Exercise'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Exercise Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="flexibility">Flexibility</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Muscle Groups
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-lg">
              {muscleGroupOptions.map((muscle) => (
                <label key={muscle} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={formData.muscleGroups.includes(muscle)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, muscleGroups: [...formData.muscleGroups, muscle] });
                      } else {
                        setFormData({
                          ...formData,
                          muscleGroups: formData.muscleGroups.filter((m) => m !== muscle),
                        });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{muscle.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Equipment
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-lg">
              {equipmentOptions.map((equip) => (
                <label key={equip} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={formData.equipment?.includes(equip)}
                    onChange={(e) => {
                      const current = formData.equipment || [];
                      if (e.target.checked) {
                        setFormData({ ...formData, equipment: [...current, equip] });
                      } else {
                        setFormData({
                          ...formData,
                          equipment: current.filter((eq) => eq !== equip),
                        });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{equip.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Instructions
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              rows={4}
              placeholder="Describe how to perform this exercise..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1" loading={createMutation.isPending || updateMutation.isPending}>
              {exercise ? 'Update Exercise' : 'Create Exercise'}
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

export default ExercisesPage;
