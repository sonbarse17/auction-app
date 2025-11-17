import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Zap, X } from 'lucide-react';
import { useToastStore } from '../stores/toastStore';
import { autoBidApi } from '../services/api';

interface AutoBidPanelProps {
  auctionId: number;
  playerId: number;
  playerName: string;
  currentBid: number;
  teamId: number;
}

export const AutoBidPanel: React.FC<AutoBidPanelProps> = ({ 
  auctionId,
  playerId, 
  playerName, 
  currentBid,
  teamId
}) => {
  const [showModal, setShowModal] = useState(false);
  const [maxBid, setMaxBid] = useState(currentBid + 100000);
  const [isActive, setIsActive] = useState(false);
  const { addToast } = useToastStore();

  const handleActivate = async () => {
    if (maxBid <= currentBid) {
      addToast('Max bid must be higher than current bid', 'error');
      return;
    }

    try {
      await autoBidApi.create({
        auction_id: auctionId,
        player_id: playerId,
        team_id: teamId,
        max_amount: maxBid
      });
      setIsActive(true);
      setShowModal(false);
      addToast(`Auto-bid activated for ${playerName}`, 'success');
    } catch (err) {
      addToast('Failed to activate auto-bid', 'error');
    }
  };

  const handleDeactivate = async () => {
    try {
      await autoBidApi.deactivate(auctionId, playerId, teamId);
      setIsActive(false);
      addToast('Auto-bid deactivated', 'info');
    } catch (err) {
      addToast('Failed to deactivate auto-bid', 'error');
    }
  };

  return (
    <>
      <div className="flex gap-2">
        {!isActive ? (
          <Button onClick={() => setShowModal(true)} variant="secondary" className="flex-1">
            <Zap className="w-4 h-4 mr-2" />
            Auto-Bid
          </Button>
        ) : (
          <div className="flex-1 flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <Zap className="text-yellow-600" size={16} />
              <span className="text-sm font-medium">Active (Max: ₹{maxBid.toLocaleString()})</span>
            </div>
            <button onClick={handleDeactivate} className="text-red-600 hover:text-red-800">
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Zap className="text-yellow-600" />
                Set Auto-Bid
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Player: <span className="font-semibold">{playerName}</span></p>
                <p className="text-sm text-gray-600 mb-4">Current Bid: <span className="font-semibold">₹{currentBid.toLocaleString()}</span></p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Maximum Bid Amount (₹)</label>
                <input
                  type="number"
                  value={maxBid}
                  onChange={(e) => setMaxBid(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  min={currentBid + 1}
                />
                <p className="text-xs text-gray-500 mt-1">
                  System will automatically bid up to this amount when outbid
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>How it works:</strong> When another team bids, the system will automatically place a counter-bid on your behalf until your maximum bid is reached.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleActivate} className="flex-1">
                  Activate Auto-Bid
                </Button>
                <Button onClick={() => setShowModal(false)} variant="secondary" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
