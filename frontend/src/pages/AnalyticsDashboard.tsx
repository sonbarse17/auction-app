import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, TrendingUp, Users, DollarSign, Download } from 'lucide-react';
import axios from 'axios';
import SpendingChart from '../components/SpendingChart';
import PositionPieChart from '../components/PositionPieChart';
import BiddingActivityChart from '../components/BiddingActivityChart';

export default function AnalyticsDashboard() {
  const { id } = useParams<{ id: string }>();
  const auctionId = parseInt(id || '0');

  const [summary, setSummary] = useState<any>(null);
  const [teamSpending, setTeamSpending] = useState<any[]>([]);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [positionSpending, setPositionSpending] = useState<any[]>([]);
  const [biddingActivity, setBiddingActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [auctionId]);

  const fetchAnalytics = async () => {
    try {
      const [summaryRes, teamRes, playersRes, positionRes, activityRes] = await Promise.all([
        axios.get(`/api/v1/analytics/auctions/${auctionId}/summary`),
        axios.get(`/api/v1/analytics/auctions/${auctionId}/team-spending`),
        axios.get(`/api/v1/analytics/auctions/${auctionId}/top-players?limit=10`),
        axios.get(`/api/v1/analytics/auctions/${auctionId}/position-spending`),
        axios.get(`/api/v1/analytics/auctions/${auctionId}/bidding-activity`)
      ]);

      setSummary(summaryRes.data);
      setTeamSpending(teamRes.data);
      setTopPlayers(playersRes.data);
      setPositionSpending(positionRes.data);
      setBiddingActivity(activityRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async (endpoint: string, filename: string) => {
    try {
      const response = await axios.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center dark:text-white">Loading analytics...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold dark:text-white">Auction Analytics</h1>
          <button
            onClick={() => downloadCSV(`/api/v1/exports/auctions/${auctionId}/transactions`, 'transactions.csv')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download size={20} />
            Export All
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Players</p>
                <p className="text-3xl font-bold dark:text-white">{summary?.total_players || 0}</p>
              </div>
              <Users className="text-blue-600" size={40} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Players Sold</p>
                <p className="text-3xl font-bold text-green-600">{summary?.players_sold || 0}</p>
              </div>
              <TrendingUp className="text-green-600" size={40} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Spent</p>
                <p className="text-3xl font-bold text-purple-600">₹{(summary?.total_spent || 0).toLocaleString()}</p>
              </div>
              <DollarSign className="text-purple-600" size={40} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Price</p>
                <p className="text-3xl font-bold text-orange-600">₹{Math.round(summary?.avg_price || 0).toLocaleString()}</p>
              </div>
              <BarChart className="text-orange-600" size={40} />
            </div>
          </div>
        </div>

        {/* Team Spending Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow mb-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Team Spending Comparison</h2>
          <SpendingChart data={teamSpending} />
        </div>

        {/* Team Spending Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow mb-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Team Spending Details</h2>
          <div className="space-y-4">
            {teamSpending.map((team) => (
              <div key={team.team_id} className="border-b dark:border-gray-700 pb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold dark:text-white">{team.team_name}</span>
                  <span className="text-lg font-bold dark:text-white">₹{team.spent.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full"
                    style={{ width: `${(team.spent / team.total_budget) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>{team.players_bought} players</span>
                  <span>Remaining: ₹{team.remaining_budget.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bidding Activity Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow mb-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Bidding Activity</h2>
          <BiddingActivityChart data={biddingActivity} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Players */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Most Expensive Players</h2>
            <div className="space-y-3">
              {topPlayers.map((player, idx) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                    <div>
                      <div className="font-semibold dark:text-white">{player.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{player.team_name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">₹{player.sold_price.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{player.bid_count} bids</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Position Spending */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Position Distribution</h2>
            <PositionPieChart data={positionSpending} />
            <div className="space-y-4 mt-6">
              {positionSpending.map((pos) => (
                <div key={pos.position}>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold dark:text-white">{pos.position || 'Unknown'}</span>
                    <span className="dark:text-white">₹{pos.total_spent.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                        style={{ width: `${(pos.total_spent / summary?.total_spent) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{pos.players_count} players</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
