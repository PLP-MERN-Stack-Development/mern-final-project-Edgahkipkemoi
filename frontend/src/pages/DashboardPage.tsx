import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { userAPI } from '@/lib/api';
import { Workout, Goal } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import StatsCard from '@/components/dashboard/StatsCard';
import StreakCard from '@/components/dashboard/StreakCard';
import WeeklyChart from '@/components/dashboard/WeeklyChart';
import {
  Dumbbell,
  Target,
  TrendingUp,
  Calendar,
  Plus,
  Activity,
  Clock,
  Flame,
  Award,
  Zap,
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await userAPI.getDashboard();
      return response.data;
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

  const workoutStats = (dashboardData as any)?.workoutStats || { total: 0, thisWeek: 0, thisMonth: 0 };
  const goalStats = (dashboardData as any)?.goalStats || { total: 0, completed: 0, active: 0, completionRate: 0 };
  const streakStats = (dashboardData as any)?.streakStats || { current: 0, longest: 0, totalWorkouts: 0 };
  const recentWorkouts = (dashboardData as any)?.recentWorkouts || [];
  const upcomingGoals = (dashboardData as any)?.upcomingGoals || [];
  const weeklyData = (dashboardData as any)?.weeklyData || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's your fitness overview.</p>
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

      {/* AI Insights */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="flex items-start space-x-4">
          <Zap className="h-8 w-8 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold mb-2">💡 Your Weekly Insight</h3>
            <p className="text-white/90">
              Great progress! You improved your workout consistency by <strong>15%</strong> this week. 
              Keep up the momentum! 🚀
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Workouts"
          value={workoutStats?.total || 0}
          icon={Dumbbell}
          color="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="This Week"
          value={workoutStats?.thisWeek || 0}
          icon={Calendar}
          color="success"
        />
        <StatsCard
          title="Goals Completed"
          value={goalStats?.completed || 0}
          icon={Target}
          color="warning"
        />
        <StatsCard
          title="Completion Rate"
          value={`${goalStats?.completionRate || 0}%`}
          icon={TrendingUp}
          color="error"
        />
      </div>

      {/* Streak and Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StreakCard 
          currentStreak={streakStats?.current || 0} 
          longestStreak={streakStats?.longest || 0} 
        />
        <div className="lg:col-span-2">
          <WeeklyChart data={weeklyData.length > 0 ? weeklyData.map((d: any) => ({
            day: d.day,
            workouts: d.workouts,
            calories: Math.round(d.calories / 10) // Divide by 10 for better chart scale
          })) : [
            { day: 'Sun', workouts: 0, calories: 0 },
            { day: 'Mon', workouts: 0, calories: 0 },
            { day: 'Tue', workouts: 0, calories: 0 },
            { day: 'Wed', workouts: 0, calories: 0 },
            { day: 'Thu', workouts: 0, calories: 0 },
            { day: 'Fri', workouts: 0, calories: 0 },
            { day: 'Sat', workouts: 0, calories: 0 },
          ]} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3 mb-2">
            <Award className="h-5 w-5 text-warning-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Best Week</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">Last Week</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">5 workouts completed</p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-2">
            <Dumbbell className="h-5 w-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Most Frequent</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">Strength</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Training type</p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="h-5 w-5 text-success-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">Active</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">3 days in a row</p>
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
              recentWorkouts.map((workout: Workout) => (
                <div key={workout._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{workout.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(workout.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
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
              upcomingGoals.map((goal: Goal) => (
                <div key={goal._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900 dark:text-white">{goal.title}</p>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {goal.daysRemaining} days left
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${goal.progressPercentage || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
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
          <Link to="/workouts" className="p-4 text-center border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Dumbbell className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Start Workout</p>
          </Link>
          <Link to="/exercises" className="p-4 text-center border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Activity className="h-8 w-8 text-success-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Browse Exercises</p>
          </Link>
          <Link to="/goals" className="p-4 text-center border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Target className="h-8 w-8 text-warning-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Set Goal</p>
          </Link>
          <Link to="/social" className="p-4 text-center border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <TrendingUp className="h-8 w-8 text-error-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Social Feed</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;