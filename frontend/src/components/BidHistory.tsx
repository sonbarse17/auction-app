import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { BidWithTeam } from '../types';
import { Card } from './Card';

interface BidHistoryProps {
  bids: BidWithTeam[];
}

export const BidHistory: React.FC<BidHistoryProps> = ({ bids }) => {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Bid History</h3>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {bids.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No bids yet</p>
        ) : (
          bids.map((bid) => (
            <div key={bid.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">{bid.team_name}</span>
              <span className="text-green-600 font-bold">₹{bid.amount.toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
