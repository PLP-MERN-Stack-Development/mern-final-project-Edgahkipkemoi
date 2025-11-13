import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { workoutAPI } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { ArrowLeft, Calendar, Clock, Flame, Dumbbell, CheckCircle } from 'lucide-react';

const WorkoutDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['workout', id],
    queryFn: async () => {
      const response = await workoutAPI.getWorkout(id!);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12 card">
        <p className="text-gray-500 dark:text-gray-400">Workout not found</p>
        <Button onClick={() => navigate('/workouts')} className="mt-4">
          Back to Workouts
        </Button>
      </div>
    );
  }

  const workout = (data as any).workout;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate('/workouts')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {workout.name}
            </h1>
            {workout.description && (
              <p className="text-gray-600 dark:text-gray-400">{workout.description}</p>
            )}
          </div>
          {workout.isTemplate && (
            <span className="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">
              Template
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(workout.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {workout.duration && (
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                <p className="font-medium text-gray-900 dark:text-white">{workout.duration} min</p>
              </div>
            </div>
          )}

          {workout.caloriesBurned && (
            <div className="flex items-center space-x-3">
              <Flame className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Calories</p>
                <p className="font-medium text-gray-900 dark:text-white">{workout.caloriesBurned}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <Dumbbell className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Exercises</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {workout.exercises.length}
              </p>
            </div>
          </div>
        </div>

        {workout.tags && workout.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {workout.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Exercises</h2>
        {workout.exercises.map((workoutExercise: any, index: number) => {
          const exercise = typeof workoutExercise.exercise === 'object' 
            ? workoutExercise.exercise 
            : null;
          
          return (
            <div key={index} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {exercise?.name || 'Exercise'}
                  </h3>
                  {exercise && (
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded">
                        {exercise.category}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                        {exercise.difficulty}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {workoutExercise.sets.length} sets
                </span>
              </div>

              {exercise?.muscleGroups && exercise.muscleGroups.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Muscle Groups
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {exercise.muscleGroups.map((muscle: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {muscle.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sets</p>
                <div className="space-y-2">
                  {workoutExercise.sets.map((set: any, setIndex: number) => (
                    <div
                      key={setIndex}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Set {setIndex + 1}
                        </span>
                        {set.reps && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {set.reps} reps
                          </span>
                        )}
                        {set.weight && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {set.weight} kg
                          </span>
                        )}
                        {set.duration && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {set.duration}s
                          </span>
                        )}
                        {set.distance && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {set.distance}m
                          </span>
                        )}
                      </div>
                      {set.completed && (
                        <CheckCircle className="h-5 w-5 text-success-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {workoutExercise.notes && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{workoutExercise.notes}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutDetailPage;