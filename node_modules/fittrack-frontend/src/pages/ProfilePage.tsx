import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import ImageUpload from '@/components/profile/ImageUpload';
import { User, Edit, Mail, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { updateUser } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => userAPI.updateProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      const updatedUser = (response.data as any).user;
      updateUser({
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        isEmailVerified: updatedUser.isEmailVerified,
        profilePicture: updatedUser.profilePicture,
      });
      toast.success('Profile updated!');
      setIsEditing(false);
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const user = (data as any)?.user;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {isEditing ? (
        <EditProfileForm user={user} onSubmit={(data) => updateMutation.mutate(data)} />
      ) : (
        <ViewProfile user={user} />
      )}
    </div>
  );
};

interface ViewProfileProps {
  user: any;
}

const ViewProfile: React.FC<ViewProfileProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-start space-x-6">
          <div className="relative">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl font-bold">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>

            <div className="flex items-center space-x-6 mt-4">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Array.isArray(user.followers) ? user.followers.length : 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Followers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Array.isArray(user.following) ? user.following.length : 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Following</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Personal Information
          </h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Mail className="h-5 w-5 mr-3" />
              <span>{user.email}</span>
            </div>
            {user.dateOfBirth && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Calendar className="h-5 w-5 mr-3" />
                <span>{new Date(user.dateOfBirth).toLocaleDateString()}</span>
              </div>
            )}
            {user.gender && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <User className="h-5 w-5 mr-3" />
                <span className="capitalize">{user.gender}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Fitness Stats
          </h3>
          <div className="space-y-3">
            {user.height && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Height</span>
                <span className="font-medium text-gray-900 dark:text-white">{user.height} cm</span>
              </div>
            )}
            {user.weight && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Weight</span>
                <span className="font-medium text-gray-900 dark:text-white">{user.weight} kg</span>
              </div>
            )}
            {user.activityLevel && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Activity Level</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {user.activityLevel.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface EditProfileFormProps {
  user: any;
  onSubmit: (data: any) => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ user, onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user.gender || '',
    height: user.height || '',
    weight: user.weight || '',
    activityLevel: user.activityLevel || '',
    profilePicture: user.profilePicture || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Profile Picture
        </h3>
        <ImageUpload
          currentImage={formData.profilePicture}
          onImageChange={(imageUrl) => setFormData({ ...formData, profilePicture: imageUrl })}
        />
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Fitness Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              min="50"
              max="300"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              min="20"
              max="500"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Activity Level
            </label>
            <select
              value={formData.activityLevel}
              onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select activity level</option>
              <option value="sedentary">Sedentary</option>
              <option value="lightly_active">Lightly Active</option>
              <option value="moderately_active">Moderately Active</option>
              <option value="very_active">Very Active</option>
              <option value="extremely_active">Extremely Active</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button type="submit" className="flex-1">
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default ProfilePage;
