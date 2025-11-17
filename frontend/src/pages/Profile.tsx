import React, { useState, useRef } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { User, Mail, Lock, Save, Upload, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { useThemeStore } from '../stores/themeStore';
import { authApi } from '../services/api';
import axios from 'axios';

export const Profile: React.FC = () => {
  const { user, loadUser } = useAuthStore();
  const { addToast } = useToastStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profile_photo || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      addToast('Name is required', 'error');
      return;
    }

    setLoading(true);
    try {
      await axios.put('/api/v1/auth/profile', { full_name: fullName });
      if (profilePhoto !== user?.profile_photo) {
        await axios.patch('/api/v1/auth/me', { profile_photo: profilePhoto });
      }
      await loadUser();
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('File size must be less than 5MB', 'error');
      return;
    }

    setUploading(true);
    try {
      const { data } = await authApi.uploadPhoto(file);
      setProfilePhoto(data.photo_url);
      addToast('Photo uploaded successfully', 'success');
    } catch (err) {
      addToast('Failed to upload photo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('All password fields are required', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      await axios.put('/api/v1/auth/password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast('Password changed successfully', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.detail || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

        {/* Profile Info */}
        <Card className="mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Profile Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Profile Photo</label>
              <div className="flex items-center space-x-4 mb-4">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-semibold">
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="text"
                    value={profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                    placeholder="Photo URL or upload"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    variant="secondary"
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border rounded-lg text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Roles</label>
              <div className="flex flex-wrap gap-2">
                {user?.roles.map((role) => (
                  <span key={role} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <Button onClick={handleUpdateProfile} disabled={loading || uploading}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Appearance</h2>
              <p className="text-sm text-gray-600">Customize your interface theme</p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </Card>

        {/* Security */}
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <Lock className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Change Password</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <Button onClick={handleChangePassword} disabled={loading}>
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
