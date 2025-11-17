import { useEffect, useState } from 'react';
import { BarChart3, Award } from 'lucide-react';
import axios from 'axios';

interface PlayerStats {
  player_id: number;
  stats_data: {
    matches?: number;
    runs?: number;
    wickets?: number;
    average?: number;
    strike_rate?: number;
    economy?: number;
    [key: string]: any;
  };
}

interface PlayerStatsCardProps {
  playerId: number;
}

export default function PlayerStatsCard({ playerId }: PlayerStatsCardProps) {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [playerId]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/v1/players/${playerId}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!stats || Object.keys(stats.stats_data).length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow text-center text-gray-500 dark:text-gray-400">
        <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
        <p>No statistics available</p>
      </div>
    );
  }

  const { stats_data } = stats;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <div className="flex items-center gap-2 mb-4">
        <Award size={20} className="text-yellow-600" />
        <h3 className="font-semibold dark:text-white">Player Statistics</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats_data.matches && (
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats_data.matches}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Matches</div>
          </div>
        )}
        {stats_data.runs !== undefined && (
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats_data.runs}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Runs</div>
          </div>
        )}
        {stats_data.wickets !== undefined && (
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats_data.wickets}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Wickets</div>
          </div>
        )}
        {stats_data.average && (
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats_data.average}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Average</div>
          </div>
        )}
        {stats_data.strike_rate && (
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats_data.strike_rate}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Strike Rate</div>
          </div>
        )}
        {stats_data.economy && (
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{stats_data.economy}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Economy</div>
          </div>
        )}
      </div>
    </div>
  );
}
