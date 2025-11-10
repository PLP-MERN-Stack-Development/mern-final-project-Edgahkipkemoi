import React from 'react';
import { User } from 'lucide-react';

const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center py-12">
        <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Profile management coming soon...</p>
      </div>
    </div>
  );
};

export default ProfilePage;