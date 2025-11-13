import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Play, Clock, Flame, Target, Search, Plus, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ExerciseGuideModal from '@/components/exercises/ExerciseGuideModal';
import { searchWorkoutGuides, WorkoutGuide } from '@/services/externalWorkoutAPI';
import { workoutAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const WorkoutGuidesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [selectedGuide, setSelectedGuide] = useState<WorkoutGuide | null>(null);
  const queryClient = useQueryClient();

  // Fetch workout guides
  const { data: guidesData, isLoading } = useQuery({
    queryKey: ['workout-guides', searchTerm, selectedCategory],
    queryFn: async () => {
      const filters = selectedCategory !== 'all' ? { category: selectedCategory } : undefined;
      const guides = await searchWorkoutGuides(searchTerm, filters);
      return guides;
    },
  });

  // Add workout to user's workouts
  const addToMyWorkouts = useMutation({
    mutationFn: async (guide: WorkoutGuide) => {
      const workoutData = {
        name: guide.name,
        description: guide.description,
        exercises: guide.exercises.map(ex => ({
          exercise: ex.exercise.id,
          name: ex.exercise.name,
          sets: Array(ex.sets).fill(null).map(() => ({ reps: parseInt(ex.reps) || 10, weight: 0 })),
          notes: `${ex.sets} sets × ${ex.reps} reps, rest ${ex.rest}`
        })),
        duration: guide.duration,
        caloriesBurned: guide.calories,
        date: new Date().toISOString().split('T')[0],
        isTemplate: false,
        isPublic: false,
        tags: [guide.category, guide.difficulty]
      };
      return workoutAPI.createWorkout(workoutData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Workout added to My Workouts successfully!');
      setSelectedGuide(null);
    },
    onError: () => {
      toast.error('Failed to add workout. Please try again.');
    }
  });

  const guides = guidesData || [];

  const categories = [
    { value: 'all', label: 'All Guides' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'strength', label: 'Strength' },
    { value: 'flexibility', label: 'Flexibility' }
  ];

  const categoryColors: Record<string, string> = {
    beginner: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300',
    intermediate: 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300',
    advanced: 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300',
    cardio: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    strength: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    flexibility: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Guides</h1>
        <p className="text-gray-600 dark:text-gray-400">Learn proper form and technique with our guided workouts</p>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search workout guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Guides Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : guides.length === 0 ? (
        <div className="text-center py-12 card">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No guides found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map(guide => (
            <div key={guide.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{guide.name}</h3>
                <span className={`px-2 py-1 text-xs rounded ${categoryColors[guide.difficulty]}`}>
                  {guide.difficulty}
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{guide.description}</p>

              <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {guide.duration} min
                </div>
                <div className="flex items-center">
                  <Flame className="h-4 w-4 mr-1" />
                  ~{guide.calories} cal
                </div>
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  {guide.exercises.length} exercises
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Exercises:</p>
                <div className="space-y-1">
                  {guide.exercises.map((exercise, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <button
                        onClick={() => setSelectedExercise(exercise.exercise)}
                        className="text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        {exercise.exercise.name}
                      </button>
                      <span className="text-gray-500 dark:text-gray-400">
                        {exercise.sets} × {exercise.reps}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  className="flex-1" 
                  size="sm"
                  onClick={() => setSelectedGuide(guide)}
                >
                  <Play className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => addToMyWorkouts.mutate(guide)}
                  loading={addToMyWorkouts.isPending}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Workouts
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exercise Guide Modal */}
      {selectedExercise && (
        <ExerciseGuideModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onAddToWorkout={() => {
            setSelectedExercise(null);
          }}
        />
      )}

      {/* Workout Guide Detail Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedGuide.name}</h2>
              <button onClick={() => setSelectedGuide(null)} className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="flex items-center space-x-4 mb-4">
              <span className={`px-3 py-1 text-sm rounded ${categoryColors[selectedGuide.difficulty]}`}>
                {selectedGuide.difficulty}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4 inline mr-1" />
                {selectedGuide.duration} min
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                <Flame className="h-4 w-4 inline mr-1" />
                ~{selectedGuide.calories} cal
              </span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-6">{selectedGuide.description}</p>

            {selectedGuide.videoUrl && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Video Tutorial</h3>
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <iframe
                    src={selectedGuide.videoUrl.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Exercises</h3>
              <div className="space-y-3">
                {selectedGuide.exercises.map((exercise, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{exercise.exercise.name}</h4>
                      <button
                        onClick={() => setSelectedExercise(exercise.exercise)}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        View Details
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {exercise.exercise.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{exercise.sets} sets</span>
                      <span>×</span>
                      <span>{exercise.reps} reps</span>
                      <span>•</span>
                      <span>Rest: {exercise.rest}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedGuide.equipment && selectedGuide.equipment.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Equipment Needed</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedGuide.equipment.map((equip, idx) => (
                    <span key={idx} className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                      {equip}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                className="flex-1"
                onClick={() => {
                  addToMyWorkouts.mutate(selectedGuide);
                }}
                loading={addToMyWorkouts.isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                Add to My Workouts
              </Button>
              <Button variant="outline" onClick={() => setSelectedGuide(null)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutGuidesPage;
