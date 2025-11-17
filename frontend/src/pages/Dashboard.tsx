import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Route based on user role
    if (user.roles.includes('admin') || user.roles.includes('organizer')) {
      navigate('/organizer');
    } else if (user.roles.includes('team_owner')) {
      navigate('/teams');
    } else {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirecting to your dashboard...</p>
    </div>
  );
};
