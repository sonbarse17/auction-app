import { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

interface AutoBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  auctionId: number;
  auctionPlayerId: number;
  playerName: string;
  currentBid: number;
}

export default function AutoBidModal({ isOpen, onClose, auctionId, auctionPlayerId, playerName, currentBid }: AutoBidModalProps) {
  const [maxAmount, setMaxAmount] = useState(currentBid + 1000);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`/api/v1/auctions/${auctionId}/auto-bids`, {
        auction_player_id: auctionPlayerId,
        max_amount: maxAmount
      });
      onClose();
    } catch (error: any) {
      console.error('Failed to set auto-bid:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Set Auto-Bid</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Player: <span className="font-semibold">{playerName}</span>
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Current Bid: <span className="font-semibold">₹{currentBid.toLocaleString()}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Maximum Bid Amount
            </label>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(Number(e.target.value))}
              min={currentBid + 1000}
              step={1000}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              System will automatically bid up to this amount
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Setting...' : 'Set Auto-Bid'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
