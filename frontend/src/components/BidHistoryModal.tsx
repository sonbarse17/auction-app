import React, { useEffect, useState } from 'react';
import { X, TrendingUp, Download, Clock } from 'lucide-react';
import type { BidWithTeam } from '../types';
import { Button } from './Button';

interface BidHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  auctionId: number;
  playerId: number;
}

export const BidHistoryModal: React.FC<BidHistoryModalProps> = ({
  isOpen,
  onClose,
  playerName,
  auctionId,
  playerId,
}) => {
  const [bids, setBids] = useState<BidWithTeam[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBids();
    }
  }, [isOpen, auctionId, playerId]);

  const loadBids = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/bids/auction/${auctionId}/player/${playerId}`);
      const data = await response.json();
      setBids(data);
    } catch (err) {
      console.error('Failed to load bids:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['Team', 'Amount', 'Time'],
      ...bids.map(b => [b.team_name, b.amount, new Date(b.created_at).toLocaleString()])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playerName}_bids.csv`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-xl font-bold">Bid History - {playerName}</h2>
          </div>
          <div className="flex items-center gap-2">
            {bids.length > 0 && (
              <Button onClick={exportToCSV} variant="secondary" className="text-sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : bids.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">No bids placed yet</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {bids.map((bid, index) => (
                <div
                  key={bid.id}
                  className={`p-4 rounded-lg border-2 ${
                    index === 0 ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{bid.team_name}</span>
                        {index === 0 && (
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                            Highest
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(bid.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        index === 0 ? 'text-green-600' : 'text-gray-700'
                      }`}>
                        ₹{bid.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Bids: {bids.length}</span>
            {bids.length > 0 && (
              <span>
                Range: ₹{Math.min(...bids.map(b => b.amount)).toLocaleString()} - 
                ₹{Math.max(...bids.map(b => b.amount)).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
