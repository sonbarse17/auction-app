import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentApi, auctionApi } from '../services/api';
import type { Tournament } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Plus, Play, X } from 'lucide-react';
import { LayoutWithSidebar } from '../components/LayoutWithSidebar';
import { getNavigationLinks } from '../config/navigation';
import { useAuthStore } from '../stores/authStore';

export const OrganizerDashboard: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [purseLimit, setPurseLimit] = useState('100000000');
  const [minBidIncrement, setMinBidIncrement] = useState('1000000');
  const [maxPlayers, setMaxPlayers] = useState('15');
  const [minPlayers, setMinPlayers] = useState('11');
  const [timerDuration, setTimerDuration] = useState('30');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const { data } = await tournamentApi.list();
      setTournaments(data);
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    }
  };

  const handleCreateTournament = async () => {
    if (!name || !startDate) return;
    
    setLoading(true);
    try {
      await tournamentApi.create({
        name,
        description,
        start_date: new Date(startDate).toISOString(),
      });
      setShowCreateModal(false);
      setName('');
      setDescription('');
      setStartDate('');
      setPurseLimit('100000000');
      setMinBidIncrement('1000000');
      setMaxPlayers('15');
      setMinPlayers('11');
      setTimerDuration('30');
      loadTournaments();
    } catch (err) {
      console.error('Failed to create tournament:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAuction = async (tournamentId: number) => {
    try {
      const { data } = await auctionApi.create({
        tournament_id: tournamentId,
        name: 'Auction',
        timer_seconds: 30,
        player_ids: [1, 2, 3, 4, 5, 6, 7, 8],
      });
      navigate(`/control/${data.id}`);
    } catch (err) {
      console.error('Failed to start auction:', err);
    }
  };

  const { user } = useAuthStore();
  const nav = getNavigationLinks(user?.roles || []);

  return (
    <LayoutWithSidebar links={nav.links} title={nav.title}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Tournaments</h1>
            <Button onClick={() => { console.log('New Tournament clicked'); setShowCreateModal(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Tournament
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <Card key={tournament.id}>
                <h3 className="text-xl font-semibold mb-2">{tournament.name}</h3>
                <p className="text-gray-600 mb-4">{tournament.description}</p>
                <div className="flex gap-2">
                  <Button onClick={() => { console.log('Create Auction clicked for tournament:', tournament.id); handleStartAuction(tournament.id); }} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Create Auction
                  </Button>
                </div>
              </Card>
            ))}
          </div>
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create Tournament</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tournament Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="IPL 2024 Auction"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  placeholder="Tournament description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Start Date *</label>
                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Bidding Criteria & Purse Limits</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Purse Limit (₹)</label>
                    <input type="number" value={purseLimit} onChange={(e) => setPurseLimit(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="100000000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Bid Increment (₹)</label>
                    <input type="number" value={minBidIncrement} onChange={(e) => setMinBidIncrement(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="1000000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Players</label>
                    <input type="number" value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="15" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Players</label>
                    <input type="number" value={minPlayers} onChange={(e) => setMinPlayers(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="11" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Timer Duration (seconds)</label>
                    <input type="number" value={timerDuration} onChange={(e) => setTimerDuration(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="30" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateTournament} disabled={loading || !name || !startDate} className="flex-1">
                  {loading ? 'Creating...' : 'Create Tournament'}
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
