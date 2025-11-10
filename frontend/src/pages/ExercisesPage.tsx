import React from 'react';
import { Activity } from 'lucide-react';

const ExercisesPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Exercises</h1>
        <p className="text-gray-600">Exercise library coming soon...</p>
      </div>
    </div>
  );
};

export default ExercisesPage;