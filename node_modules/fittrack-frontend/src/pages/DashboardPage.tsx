import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { userAPI } from '@/lib/api';
import { DashboardData } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import {
  Dumbbell,
  Target,
  TrendingUp,
  Calendar,
  Plus,
  Activity,
  Clock,
  Flame,
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await userAPI.getDashboard();
      return response.data as DashboardData;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  const { workoutStats, goalStats, recentWorkouts, upcomingGoals } = dashboardData || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your fitness overview.</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/workouts">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Workout
            </Button>
          </Link>
          <Link to="/goals">
            <Button size="sm">
              <Target className="h-4 w-4 mr-2" />
              Set Goal
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Workouts */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Dumbbell className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Workouts</p>
              <p className="text-2xl font-bold text-gray-900">
                {workoutStats?.totalWorkouts || 0}
              </p>
            </div>
          </div>
        </div>

        {/* This Week */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {workoutStats?.thisWeek || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Goals Completed */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Goals Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {goalStats?.completed || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-error-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {goalStats?.completionRate || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Workouts */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Recent Workouts</h2>
            <Link to="/workouts" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentWorkouts && recentWorkouts.length > 0 ? (
              recentWorkouts.map((workout) => (
                <div key={workout._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">{workout.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(workout.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {workout.duration && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {workout.duration}m
                      </div>
                    )}
                    {workout.caloriesBurned && (
                      <div className="flex items-center">
                        <Flame className="h-4 w-4 mr-1" />
                        {workout.caloriesBurned}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No workouts yet</p>
                <Link to="/workouts">
                  <Button variant="outline" size="sm" className="mt-2">
                    Start your first workout
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Goals */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Goals</h2>
            <Link to="/goals" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingGoals && upcomingGoals.length > 0 ? (
              upcomingGoals.map((goal) => (
                <div key={goal._id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{goal.title}</p>
                    <span className="text-sm text-gray-500">
                      {goal.daysRemaining} days left
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${goal.progressPercentage || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                    <span>{goal.progressPercentage || 0}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No active goals</p>
                <Link to="/goals">
                  <Button variant="outline" size="sm" className="mt-2">
                    Set your first goal
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/workouts" className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Dumbbell className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Start Workout</p>
          </Link>
          <Link to="/exercises" className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Activity className="h-8 w-8 text-success-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Browse Exercises</p>
          </Link>
          <Link to="/goals" className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Target className="h-8 w-8 text-warning-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Set Goal</p>
          </Link>
          <Link to="/social" className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TrendingUp className="h-8 w-8 text-error-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Social Feed</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;