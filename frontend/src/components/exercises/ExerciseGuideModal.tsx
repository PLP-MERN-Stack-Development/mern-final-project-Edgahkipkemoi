import React from 'react';
import { X, Play, Target, AlertCircle } from 'lucide-react';
import { Exercise } from '@/types';
import Button from '@/components/ui/Button';

interface ExerciseGuideModalProps {
  exercise: Exercise & {
    instructions?: string[];
    videoUrl?: string;
    tips?: string[];
  };
  onClose: () => void;
  onAddToWorkout?: () => void;
}

const ExerciseGuideModal: React.FC<ExerciseGuideModalProps> = ({ exercise, onClose, onAddToWorkout }) => {
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const difficultyColors = {
    beginner: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300',
    intermediate: 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300',
    advanced: 'bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{exercise.name}</h2>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`px-2 py-1 text-xs rounded ${difficultyColors[exercise.difficulty]}`}>
                {exercise.difficulty}
              </span>
              <span className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded">
                {exercise.category}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Video Section */}
        {exercise.videoUrl && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Play className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Video Tutorial</h3>
            </div>
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <iframe
                src={getYouTubeEmbedUrl(exercise.videoUrl)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Muscle Groups */}
        {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Target Muscles</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {exercise.muscleGroups.map((muscle, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                >
                  {muscle.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Equipment */}
        {exercise.equipment && exercise.equipment.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Equipment Needed</h3>
            <div className="flex flex-wrap gap-2">
              {exercise.equipment.map((equip, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full"
                >
                  {equip.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {exercise.instructions && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How to Perform</h3>
            {typeof exercise.instructions === 'string' ? (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{exercise.instructions}</p>
            ) : (
              <ol className="space-y-2">
                {exercise.instructions.map((step, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 text-white text-sm flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {/* Tips */}
        {exercise.tips && exercise.tips.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="h-5 w-5 text-warning-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pro Tips</h3>
            </div>
            <div className="space-y-2">
              {exercise.tips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                  <span className="text-warning-600">💡</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onAddToWorkout && (
            <Button onClick={onAddToWorkout} className="flex-1">
              Add to My Workout
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseGuideModal;
