import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auctionApi } from '../services/api';
import type { Team } from '../types';
import { Card } from '../components/Card';
import { ProfileMenu } from '../components/ProfileMenu';
import { ExportButton } from '../components/ExportButton';
import { Trophy, TrendingUp, DollarSign, Users, Play, BarChart } from 'lucide-react';
import { Button } from '../components/Button';

export const AuctionResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [stats, setStats] = useState({
    totalSpent: 0,
    playersSold: 0,
    playersUnsold: 0,
    avgPrice: 0,
    highestBid: 0,
  });

  useEffect(() => {
    loadResults();
  }, [id]);

  const loadResults = async () => {
    try {
      const { data: snapshot } = await auctionApi.snapshot(parseInt(id || '0'));
      setTeams(snapshot.team_budgets.map(tb => ({
        id: tb.team_id,
        name: tb.team_name,
        budget: tb.budget,
        remaining_budget: tb.remaining_budget,
      } as Team)));

      // Calculate stats
      const totalSpent = snapshot.team_budgets.reduce((sum, t) => sum + (t.budget - t.remaining_budget), 0);
      const playersSold = snapshot.recent_bids.length;
      
      setStats({
        totalSpent,
        playersSold,
        playersUnsold: snapshot.queue_summary.filter(p => p.status === 'unsold').length,
        avgPrice: playersSold > 0 ? totalSpent / playersSold : 0,
        highestBid: Math.max(...snapshot.recent_bids.map(b => b.amount), 0),
      });
    } catch (err) {
      console.error('Failed to load results:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Auction Results</h1>
            <p className="text-gray-600">Summary and analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate(`/analytics/${id}`)} variant="secondary">
              <BarChart className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button onClick={() => navigate(`/replay/${id}`)} variant="secondary">
              <Play className="w-4 h-4 mr-2" />
              Watch Replay
            </Button>
            <ExportButton 
              data={teams.map(t => ({
                team: t.name,
                budget: t.budget,
                spent: t.budget - t.remaining_budget,
                remaining: t.remaining_budget,
                percentUsed: ((t.budget - t.remaining_budget) / t.budget * 100).toFixed(1)
              }))} 
              filename={`auction-${id}-results`} 
            />
            <ProfileMenu />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">₹{stats.totalSpent.toLocaleString()}</p>
              </div>
              <DollarSign className="text-green-600" size={32} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Players Sold</p>
                <p className="text-2xl font-bold">{stats.playersSold}</p>
              </div>
              <Trophy className="text-yellow-600" size={32} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Price</p>
                <p className="text-2xl font-bold">₹{stats.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <TrendingUp className="text-blue-600" size={32} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Highest Bid</p>
                <p className="text-2xl font-bold">₹{stats.highestBid.toLocaleString()}</p>
              </div>
              <TrendingUp className="text-red-600" size={32} />
            </div>
          </Card>
        </div>

        {/* Team Standings */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users size={24} />
            Team Standings
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Team</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Budget</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Spent</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Remaining</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">% Used</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {teams
                  .sort((a, b) => (b.budget - b.remaining_budget) - (a.budget - a.remaining_budget))
                  .map((team, idx) => {
                    const spent = team.budget - team.remaining_budget;
                    const percentUsed = (spent / team.budget) * 100;
                    return (
                      <tr key={team.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-semibold">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium">{team.name}</td>
                        <td className="px-4 py-3 text-sm text-right">₹{team.budget.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">₹{spent.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">₹{team.remaining_budget.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-right">
                          <span className={`font-semibold ${percentUsed > 80 ? 'text-red-600' : percentUsed > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {percentUsed.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
