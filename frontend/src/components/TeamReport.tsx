import { useEffect, useState } from 'react';
import { Download, PieChart } from 'lucide-react';
import axios from 'axios';

interface TeamReportProps {
  teamId: number;
  auctionId: number;
}

export default function TeamReport({ teamId, auctionId }: TeamReportProps) {
  const [squad, setSquad] = useState<any[]>([]);
  const [composition, setComposition] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamData();
  }, [teamId, auctionId]);

  const fetchTeamData = async () => {
    try {
      const [squadRes, compRes] = await Promise.all([
        axios.get(`/api/v1/teams/${teamId}/players?auction_id=${auctionId}`),
        axios.get(`/api/v1/analytics/teams/${teamId}/squad-composition?auction_id=${auctionId}`)
      ]);
      setSquad(squadRes.data);
      setComposition(compRes.data);
    } catch (error) {
      console.error('Failed to fetch team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadRoster = async () => {
    try {
      const response = await axios.get(
        `/api/v1/exports/teams/${teamId}/roster?auction_id=${auctionId}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `team_${teamId}_roster.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4 dark:text-white">Loading team report...</div>;
  }

  const totalSpent = squad.reduce((sum, p) => sum + (p.sold_price || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Team Report</h2>
        <button
          onClick={downloadRoster}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download size={18} />
          Export Roster
        </button>
      </div>

      {/* Squad Composition */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <div className="flex items-center gap-2 mb-4">
          <PieChart size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold dark:text-white">Squad Composition</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {composition.map((pos) => (
            <div key={pos.position} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{pos.count}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{pos.position || 'Unknown'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ₹{pos.total_spent.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Player List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          Squad ({squad.length} players) - Total: ₹{totalSpent.toLocaleString()}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left dark:text-white">Player</th>
                <th className="px-4 py-2 text-left dark:text-white">Position</th>
                <th className="px-4 py-2 text-left dark:text-white">Rating</th>
                <th className="px-4 py-2 text-right dark:text-white">Base Price</th>
                <th className="px-4 py-2 text-right dark:text-white">Paid</th>
              </tr>
            </thead>
            <tbody>
              {squad.map((player) => (
                <tr key={player.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-3 font-semibold dark:text-white">{player.name}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{player.position}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{player.rating || '-'}</td>
                  <td className="px-4 py-3 text-right dark:text-gray-300">
                    ₹{player.base_price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">
                    ₹{player.sold_price?.toLocaleString() || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
