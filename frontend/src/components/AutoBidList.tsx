import { useEffect, useState } from 'react';
import { Trash2, TrendingUp } from 'lucide-react';
import axios from 'axios';

interface AutoBid {
  id: number;
  auction_player_id: number;
  max_amount: number;
  is_active: boolean;
  player_name: string;
  position: string;
  base_price: number;
}

interface AutoBidListProps {
  auctionId: number;
}

export default function AutoBidList({ auctionId }: AutoBidListProps) {
  const [autoBids, setAutoBids] = useState<AutoBid[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAutoBids = async () => {
    try {
      const response = await axios.get(`/api/v1/auctions/${auctionId}/auto-bids`);
      setAutoBids(response.data);
    } catch (error) {
      console.error('Failed to fetch auto-bids:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutoBids();
    const interval = setInterval(fetchAutoBids, 10000);
    return () => clearInterval(interval);
  }, [auctionId]);

  const handleDelete = async (autoBidId: number) => {
    try {
      await axios.delete(`/api/v1/auctions/${auctionId}/auto-bids/${autoBidId}`);
      fetchAutoBids();
    } catch (error: any) {
      console.error('Failed to remove auto-bid:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4 dark:text-white">Loading auto-bids...</div>;
  }

  if (autoBids.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
        <p>No active auto-bids</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {autoBids.map((autoBid) => (
        <div
          key={autoBid.id}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <div className="flex-1">
            <div className="font-semibold dark:text-white">{autoBid.player_name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {autoBid.position} • Max: ₹{autoBid.max_amount.toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => handleDelete(autoBid.id)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            title="Remove auto-bid"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
