import React from 'react';
import { Target } from 'lucide-react';

const GoalsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Goals</h1>
        <p className="text-gray-600">Goal tracking coming soon...</p>
      </div>
    </div>
  );
};

export default GoalsPage;