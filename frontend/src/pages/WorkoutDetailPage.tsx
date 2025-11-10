import React from 'react';
import { useParams } from 'react-router-dom';
import { Activity } from 'lucide-react';

const WorkoutDetailPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Workout Detail</h1>
        <p className="text-gray-600">Workout ID: {id}</p>
        <p className="text-gray-600">Detailed workout view coming soon...</p>
      </div>
    </div>
  );
};

export default WorkoutDetailPage;