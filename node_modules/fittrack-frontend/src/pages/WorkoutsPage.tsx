import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutAPI } from '@/lib/api';
import { Workout, WorkoutFormData } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { Dumbbell, Plus, Calendar, Clock, Flame, Copy, Trash2, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const WorkoutsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'templates'>('all');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['workouts', filter],
    queryFn: async () => {
      const params = filter === 'templates' ? { template: true } : {};
      const response = await workoutAPI.getWorkouts(params);
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => workoutAPI.deleteWorkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Workout deleted!');
    },
    onError: () => toast.error('Failed to delete workout'),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => workoutAPI.duplicateWorkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Workout duplicated!');
    },
    onError: () => toast.error('Failed to duplicate workout'),
  });

  const workouts = (data as any)?.workouts || [];

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workouts</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage your workouts</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Workout
        </Button>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          All Workouts
        </button>
        <button
          onClick={() => setFilter('templates')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'templates'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Templates
        </button>
      </div>

      {workouts.length === 0 ? (
        <div className="text-center py-12 card">
          <Dumbbell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No workouts yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Start tracking your workouts</p>
          <Button onClick={() => setIsModalOpen(true)}>Create Your First Workout</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout: Workout) => (
            <WorkoutCard
              key={workout._id}
              workout={workout}
              onDelete={() => deleteMutation.mutate(workout._id)}
              onDuplicate={() => duplicateMutation.mutate(workout._id)}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <WorkoutModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

interface WorkoutCardProps {
  workout: Workout;
  onDelete: () => void;
  onDuplicate: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onDelete, onDuplicate }) => {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{workout.name}</h3>
          {workout.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{workout.description}</p>
          )}
        </div>
        {workout.isTemplate && (
          <span className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded">
            Template
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4 mr-2" />
          {new Date(workout.date).toLocaleDateString()}
        </div>
        {workout.duration && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-2" />
            {workout.duration} minutes
          </div>
        )}
        {workout.caloriesBurned && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Flame className="h-4 w-4 mr-2" />
            {workout.caloriesBurned} calories
          </div>
        )}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {workout.exercises.length} exercises
        </div>
      </div>

      <div className="flex space-x-2">
        <Button size="sm" variant="outline" onClick={onDuplicate} className="flex-1">
          <Copy className="h-4 w-4 mr-1" />
          Duplicate
        </Button>
        <Button size="sm" variant="outline" onClick={onDelete} className="text-error-600">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

interface WorkoutModalProps {
  onClose: () => void;
}

const WorkoutModal: React.FC<WorkoutModalProps> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<WorkoutFormData>({
    name: '',
    description: '',
    exercises: [],
    duration: 0,
    caloriesBurned: 0,
    date: new Date().toISOString().split('T')[0],
    isTemplate: false,
    isPublic: false,
    tags: [],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: exercisesData, isLoading: isLoadingExercises } = useQuery({
    queryKey: ['external-exercises', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return { exercises: [] };
      setIsSearching(true);
      try {
        // Import the external API service
        const { searchExercises } = await import('@/services/externalExerciseAPI');
        const exercises = await searchExercises(searchTerm, 20);
        return { exercises };
      } catch (error) {
        console.error('Error fetching exercises:', error);
        return { exercises: [] };
      } finally {
        setIsSearching(false);
      }
    },
    enabled: searchTerm.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: (data: WorkoutFormData) => workoutAPI.createWorkout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Workout created!');
      onClose();
    },
    onError: () => toast.error('Failed to create workout'),
  });

  const addExercise = (exercise: any) => {
    if (!selectedExercises.find(e => e.id === exercise.id)) {
      setSelectedExercises([...selectedExercises, exercise]);
      setFormData({
        ...formData,
        exercises: [
          ...formData.exercises,
          {
            exercise: exercise.id,
            sets: [{ reps: 10, weight: 0 }],
            notes: '',
          } as any,
        ],
      });
      setSearchTerm(''); // Clear search after adding
    }
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((_, i) => i !== index),
    });
  };

  const updateExerciseSets = (index: number, sets: any[]) => {
    const newExercises = [...formData.exercises];
    newExercises[index].sets = sets;
    setFormData({ ...formData, exercises: newExercises });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.exercises.length === 0) {
      toast.error('Please add at least one exercise');
      return;
    }
    createMutation.mutate(formData);
  };

  const exercises = (exercisesData as any)?.exercises || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Workout</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Workout Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Calories Burned
              </label>
              <input
                type="number"
                min="0"
                value={formData.caloriesBurned}
                onChange={(e) => setFormData({ ...formData, caloriesBurned: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isTemplate}
                onChange={(e) => setFormData({ ...formData, isTemplate: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Save as template</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Make public</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Exercises
            </label>
            
            <div className="mb-3">
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
              {searchTerm && (
                <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                  {isLoadingExercises || isSearching ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      <LoadingSpinner size="sm" />
                      <p className="text-sm mt-2">Searching exercises...</p>
                    </div>
                  ) : exercises.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      <p className="text-sm">No exercises found. Try a different search term.</p>
                    </div>
                  ) : (
                    exercises.map((exercise: any) => (
                      <button
                        key={exercise.id}
                        type="button"
                        onClick={() => addExercise(exercise)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{exercise.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                              {exercise.description || 'No description'}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded">
                            {exercise.category}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {selectedExercises.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No exercises added yet. Search and add exercises above.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedExercises.map((exercise, index) => (
                  <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{exercise.name}</span>
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="text-error-600 hover:text-error-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.exercises[index]?.sets.map((set, setIndex) => (
                        <div key={setIndex} className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-12">Set {setIndex + 1}</span>
                          <input
                            type="number"
                            placeholder="Reps"
                            value={set.reps || ''}
                            onChange={(e) => {
                              const newSets = [...formData.exercises[index].sets];
                              newSets[setIndex].reps = Number(e.target.value);
                              updateExerciseSets(index, newSets);
                            }}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                          />
                          <input
                            type="number"
                            placeholder="Weight (kg)"
                            value={set.weight || ''}
                            onChange={(e) => {
                              const newSets = [...formData.exercises[index].sets];
                              newSets[setIndex].weight = Number(e.target.value);
                              updateExerciseSets(index, newSets);
                            }}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newSets = [...formData.exercises[index].sets, { reps: 10, weight: 0 }];
                          updateExerciseSets(index, newSets);
                        }}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        + Add Set
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1" loading={createMutation.isPending}>
              Create Workout
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

export default WorkoutsPage;
