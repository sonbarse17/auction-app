import React, { useEffect, useState } from 'react';
import { teamApi, tournamentApi } from '../services/api';
import type { Team, Tournament } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LayoutWithSidebar } from '../components/LayoutWithSidebar';
import { Plus, X, Users } from 'lucide-react';
import { getNavigationLinks } from '../config/navigation';
import { useAuthStore } from '../stores/authStore';

export const TeamManagement: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [tournamentId, setTournamentId] = useState<number>(0);
  const [budget, setBudget] = useState('10000000');
  const [maxPlayers, setMaxPlayers] = useState('15');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTournaments();
    loadTeams();
  }, []);

  const loadTournaments = async () => {
    try {
      const { data } = await tournamentApi.list();
      setTournaments(data);
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    }
  };

  const loadTeams = async () => {
    try {
      const { data } = await teamApi.listMyTeams();
      setTeams(data);
    } catch (err) {
      console.error('Failed to load teams:', err);
    }
  };

  const handleCreateTeam = async () => {
    if (!name || !tournamentId) return;

    setLoading(true);
    try {
      await teamApi.create({
        tournament_id: tournamentId,
        name,
        budget: parseFloat(budget),
        max_players: parseInt(maxPlayers),
      });
      setShowCreateModal(false);
      setName('');
      setTournamentId(0);
      loadTeams();
    } catch (err) {
      console.error('Failed to create team:', err);
      alert('Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const { user } = useAuthStore();
  const nav = getNavigationLinks(user?.roles || []);

  return (
    <LayoutWithSidebar links={nav.links} title={nav.title}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Teams</h1>
          <p className="text-gray-600">Manage your tournament teams</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Register Team
        </Button>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{team.name}</h3>
                  <p className="text-sm text-gray-500">Tournament #{team.tournament_id}</p>
                </div>
                <Users className="text-blue-600" size={24} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-semibold">₹{team.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-semibold text-green-600">₹{team.remaining_budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Players:</span>
                  <span className="font-semibold">{team.max_players}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {teams.length === 0 && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-4">No teams registered yet</p>
            <Button onClick={() => setShowCreateModal(true)}>Register Your First Team</Button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Register Team</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tournament *</label>
                <select
                  value={tournamentId}
                  onChange={(e) => setTournamentId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={0}>Select Tournament</option>
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Team Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Mumbai Indians"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Budget (₹) *</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max Players *</label>
                <input
                  type="number"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateTeam} disabled={loading || !name || !tournamentId} className="flex-1">
                  {loading ? 'Registering...' : 'Register Team'}
                </Button>
                <Button onClick={() => setShowCreateModal(false)} variant="secondary" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </LayoutWithSidebar>
  );
};
