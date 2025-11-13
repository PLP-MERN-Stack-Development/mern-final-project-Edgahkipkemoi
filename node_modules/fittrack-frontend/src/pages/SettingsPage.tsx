import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/ui/Button';
import { Moon, Sun, Lock, LogOut, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { user, logout, logoutAll } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'appearance' | 'account' | 'security'>('appearance');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
      </div>

      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'appearance'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Appearance
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'account'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Account
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'security'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Security
        </button>
      </div>

      {activeTab === 'appearance' && <AppearanceSettings theme={theme} toggleTheme={toggleTheme} />}
      {activeTab === 'account' && <AccountSettings user={user} logout={logout} />}
      {activeTab === 'security' && <SecuritySettings logoutAll={logoutAll} />}
    </div>
  );
};

interface AppearanceSettingsProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ theme, toggleTheme }) => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose your preferred theme for the application
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => theme === 'dark' && toggleTheme()}
            className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
              theme === 'light'
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <Sun className="h-8 w-8 text-gray-900 dark:text-white" />
            <span className="font-medium text-gray-900 dark:text-white">Light</span>
            {theme === 'light' && (
              <span className="text-xs text-primary-600 dark:text-primary-400">Active</span>
            )}
          </button>

          <button
            onClick={() => theme === 'light' && toggleTheme()}
            className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
              theme === 'dark'
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <Moon className="h-8 w-8 text-gray-900 dark:text-white" />
            <span className="font-medium text-gray-900 dark:text-white">Dark</span>
            {theme === 'dark' && (
              <span className="text-xs text-primary-600 dark:text-primary-400">Active</span>
            )}
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Display</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Compact Mode</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Reduce spacing between elements
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AccountSettingsProps {
  user: any;
  logout: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ user, logout }) => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Information
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">@{user?.username}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
            </div>
            {user?.isEmailVerified ? (
              <span className="px-2 py-1 text-xs bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300 rounded">
                Verified
              </span>
            ) : (
              <span className="px-2 py-1 text-xs bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300 rounded">
                Not Verified
              </span>
            )}
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive email updates about your activity
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Social Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get notified about likes, comments, and follows
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Goal Reminders</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive reminders about your fitness goals
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="card border-error-200 dark:border-error-800">
        <h3 className="text-lg font-semibold text-error-600 dark:text-error-400 mb-4">
          Danger Zone
        </h3>
        <div className="space-y-3">
          <Button variant="outline" onClick={logout} className="w-full text-error-600 border-error-600">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

interface SecuritySettingsProps {
  logoutAll: () => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ logoutAll }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authAPI.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Change Password
        </h3>
        {!showPasswordForm ? (
          <Button onClick={() => setShowPasswordForm(true)} variant="outline">
            <Lock className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex space-x-3">
              <Button type="submit" loading={changePasswordMutation.isPending}>
                Update Password
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Active Sessions
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Manage your active sessions across all devices
        </p>
        <Button variant="outline" onClick={logoutAll} className="text-error-600 border-error-600">
          <Shield className="h-4 w-4 mr-2" />
          Sign Out All Devices
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
