import React, { useEffect, useState } from 'react';
import { Dumbbell } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 animate-fade-in">
      <div className="text-center">
        <div className="relative">
          {/* Animated Circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-4 border-white/30 rounded-full animate-ping" />
          </div>
          
          {/* Icon */}
          <div className="relative bg-white rounded-full p-8 shadow-2xl animate-scale-in">
            <Dumbbell className="h-16 w-16 text-primary-600" />
          </div>
        </div>
        
        {/* Text */}
        <h1 className="mt-8 text-4xl font-bold text-white animate-slide-up">
          FitTrack
        </h1>
        <p className="mt-2 text-white/80 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Your Fitness Journey Starts Here
        </p>
        
        {/* Loading Indicator */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
