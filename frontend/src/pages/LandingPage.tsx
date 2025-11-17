import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { Tournament } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Trophy, Calendar, Play, LogIn } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const { data } = await tournamentApi.list();
      setTournaments(data.filter(t => t.status !== 'cancelled'));
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <Trophy size={40} />
              <h1 className="text-3xl font-bold">Sports Auction Platform</h1>
            </div>
            <div className="flex gap-3">
              {isAuthenticated ? (
                <Button onClick={() => navigate('/organizer')} variant="secondary">
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button onClick={() => navigate('/login')} variant="secondary">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                  <Button onClick={() => navigate('/register')}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold mb-6">Real-Time Player Auctions</h2>
            <p className="text-xl text-blue-100 mb-8">
              Experience the thrill of live sports player auctions. Build your dream team with strategic bidding.
            </p>
          </div>
        </div>
      </div>

      {/* Tournaments Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h3 className="text-3xl font-bold mb-2">Live & Upcoming Tournaments</h3>
          <p className="text-gray-600">Join exciting auctions and build your winning team</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl font-semibold mb-2">{tournament.name}</h4>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(tournament.status)}`}>
                    {tournament.status.toUpperCase()}
                  </span>
                </div>
                <Trophy className="text-yellow-500" size={32} />
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">{tournament.description}</p>
              
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Calendar size={16} className="mr-2" />
                {new Date(tournament.start_date).toLocaleDateString()}
              </div>

              {tournament.status === 'active' && (
                <Button onClick={() => navigate(isAuthenticated ? '/organizer' : '/login')} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  {isAuthenticated ? 'View Auction' : 'Login to Join'}
                </Button>
              )}
            </Card>
          ))}
        </div>

        {tournaments.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600 text-lg">No tournaments available at the moment</p>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12">Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="text-blue-600" size={32} />
              </div>
              <h4 className="text-xl font-semibold mb-2">Real-Time Bidding</h4>
              <p className="text-gray-600">Live WebSocket-based bidding with instant updates</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-green-600" size={32} />
              </div>
              <h4 className="text-xl font-semibold mb-2">Team Management</h4>
              <p className="text-gray-600">Register teams, manage budgets, and build rosters</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-purple-600" size={32} />
              </div>
              <h4 className="text-xl font-semibold mb-2">Tournament Analytics</h4>
              <p className="text-gray-600">Detailed statistics and auction results</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
