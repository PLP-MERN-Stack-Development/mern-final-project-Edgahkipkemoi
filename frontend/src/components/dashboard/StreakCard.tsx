import React from 'react';
import { Flame } from 'lucide-react';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

const StreakCard: React.FC<StreakCardProps> = ({ currentStreak, longestStreak }) => {
  return (
    <div className="card bg-gradient-to-br from-orange-500 to-red-600 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">Current Streak</p>
          <p className="text-4xl font-bold mt-2">{currentStreak}</p>
          <p className="text-sm mt-1 opacity-90">days in a row 🔥</p>
          <p className="text-xs mt-2 opacity-75">Longest: {longestStreak} days</p>
        </div>
        <Flame className="h-16 w-16 opacity-20" />
      </div>
    </div>
  );
};

export default StreakCard;
