import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { LayoutWithSidebar } from '../components/LayoutWithSidebar';
import { Users, Shield, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { getNavigationLinks } from '../config/navigation';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { adminApi } from '../services/api';
import type { User } from '../types';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingRoles, setEditingRoles] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const { addToast } = useToastStore();
  const availableRoles = ['admin', 'organizer', 'team_owner', 'spectator'];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await adminApi.listUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
      addToast('Failed to load users', 'error');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminApi.deleteUser(id);
      addToast('User deleted successfully', 'success');
      loadUsers();
    } catch (err) {
      addToast('Failed to delete user', 'error');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await adminApi.approveUser(id);
      addToast('User approved', 'success');
      loadUsers();
    } catch (err) {
      addToast('Failed to approve user', 'error');
    }
  };

  const handleEditRoles = (user: User) => {
    setEditingRoles(user.id);
    setSelectedRoles(user.roles);
  };

  const handleSaveRoles = async (userId: number) => {
    try {
      await adminApi.updateRoles(userId, selectedRoles);
      addToast('Roles updated', 'success');
      setEditingRoles(null);
      loadUsers();
    } catch (err) {
      addToast('Failed to update roles', 'error');
    }
  };

  const { user } = useAuthStore();
  const nav = getNavigationLinks(user?.roles || []);

  return (
    <LayoutWithSidebar links={nav.links} title={nav.title}>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-gray-600">Manage users and system settings</p>
          </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="text-blue-600" size={32} />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold">{users.filter(u => u.roles.includes('admin')).length}</p>
              </div>
              <Shield className="text-red-600" size={32} />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Team Owners</p>
                <p className="text-2xl font-bold">{users.filter(u => u.roles.includes('team_owner')).length}</p>
              </div>
              <Users className="text-green-600" size={32} />
            </div>
          </Card>
      </div>

      {/* Users Table */}
      <Card>
          <h2 className="text-xl font-bold mb-4">User Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Roles</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Created</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{user.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{user.full_name}</td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-sm">
                      {user.is_approved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          <CheckCircle size={14} /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                          <XCircle size={14} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingRoles === user.id ? (
                        <div className="flex flex-col gap-1">
                          {availableRoles.map(role => <label key={role} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={selectedRoles.includes(role)} onChange={(e) => { if (e.target.checked) { setSelectedRoles([...selectedRoles, role]); } else { setSelectedRoles(selectedRoles.filter(r => r !== role)); } }} />{role}</label>)}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map(role => <span key={role} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{role}</span>)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        {!user.is_approved && <button onClick={() => handleApprove(user.id)} className="text-green-600 hover:text-green-800" title="Approve"><CheckCircle size={18} /></button>}
                        {editingRoles === user.id ? <button onClick={() => handleSaveRoles(user.id)} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Save</button> : <button onClick={() => handleEditRoles(user)} className="text-blue-600 hover:text-blue-800" title="Edit Roles"><Shield size={18} /></button>}
                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-800" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
    </LayoutWithSidebar>
  );
};
