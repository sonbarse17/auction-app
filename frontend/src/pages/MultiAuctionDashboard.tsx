import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, CheckCircle, Clock, Copy, BarChart3 } from 'lucide-react';
import { Layout } from '../components/Layout';
import axios from 'axios';

interface AuctionOverview {
  id: number;
  name: string;
  status: string;
  tournament_name: string;
  total_players: number;
  sold_count: number;
  total_spent: number;
  created_at: string;
}

export default function MultiAuctionDashboard() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState<AuctionOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [auctionsRes, countRes] = await Promise.all([
        axios.get('/api/v1/multi-auction/overview'),
        axios.get('/api/v1/multi-auction/active-count')
      ]);
      setAuctions(auctionsRes.data);
      setActiveCount(countRes.data.active_count);
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async (auctionId: number, name: string, tournamentId: number) => {
    try {
      await axios.post('/api/v1/multi-auction/clone', {
        auction_id: auctionId,
        new_name: `${name} (Copy)`,
        tournament_id: tournamentId
      });
      fetchData();
    } catch (error) {
      console.error('Failed to clone auction:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="text-green-600" size={20} />;
      case 'paused':
        return <Pause className="text-yellow-600" size={20} />;
      case 'completed':
        return <CheckCircle className="text-blue-600" size={20} />;
      default:
        return <Clock className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return <div className="p-8 text-center dark:text-white">Loading auctions...</div>;
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold dark:text-white">Auction Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {activeCount} active auction{activeCount !== 1 ? 's' : ''} • {auctions.length} total
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Auctions</div>
            <div className="text-2xl font-bold dark:text-white">{auctions.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            <div className="text-2xl font-bold text-blue-600">
              {auctions.filter(a => a.status === 'completed').length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {auctions.filter(a => a.status === 'pending').length}
            </div>
          </div>
      </div>

      {/* Auctions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <div key={auction.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold dark:text-white mb-1">{auction.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{auction.tournament_name}</p>
                  </div>
                  {getStatusIcon(auction.status)}
                </div>

                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${getStatusColor(auction.status)}`}>
                  {auction.status.toUpperCase()}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Players</span>
                    <span className="font-semibold dark:text-white">{auction.sold_count}/{auction.total_players}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Spent</span>
                    <span className="font-semibold dark:text-white">₹{auction.total_spent.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(auction.sold_count / auction.total_players) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/control/${auction.id}`)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => navigate(`/analytics/${auction.id}`)}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    title="Analytics"
                  >
                    <BarChart3 size={18} />
                  </button>
                  <button
                    onClick={() => handleClone(auction.id, auction.name, auction.id)}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    title="Clone"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>
            </div>
        ))}
      </div>
    </Layout>
  );
}
