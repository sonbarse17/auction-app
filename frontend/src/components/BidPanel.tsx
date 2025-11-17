import React, { useState, useEffect } from 'react';
import { Gavel, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { useToastStore } from '../stores/toastStore';

interface BidPanelProps {
  basePrice: number;
  highestBid: number | null;
  highestBidder: string | null;
  remainingBudget: number;
  onPlaceBid: (amount: number) => void;
}

export const BidPanel: React.FC<BidPanelProps> = ({
  basePrice,
  highestBid,
  highestBidder,
  remainingBudget,
  onPlaceBid,
}) => {
  const minBid = highestBid ? highestBid + 1000 : basePrice;
  const [customAmount, setCustomAmount] = useState(minBid.toString());
  const { addToast } = useToastStore();
  const [lowBudgetWarned, setLowBudgetWarned] = useState(false);

  useEffect(() => {
    setCustomAmount(minBid.toString());
  }, [minBid]);

  useEffect(() => {
    const budgetPercentage = (remainingBudget / (remainingBudget + 1)) * 100;
    if (budgetPercentage < 20 && !lowBudgetWarned && remainingBudget > 0) {
      addToast('Low budget warning! Less than 20% remaining', 'warning');
      setLowBudgetWarned(true);
    }
  }, [remainingBudget, lowBudgetWarned, addToast]);

  const presetIncrements = [1000, 5000, 10000, 25000];

  const handlePresetBid = (increment: number) => {
    const amount = minBid + increment;
    if (amount <= remainingBudget) {
      onPlaceBid(amount);
    }
  };

  const handleCustomBid = () => {
    const amount = parseFloat(customAmount);
    if (amount >= minBid && amount <= remainingBudget) {
      onPlaceBid(amount);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Gavel className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Place Your Bid</h3>
      </div>

      {/* Current Highest Bid */}
      {highestBid && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Current Highest Bid</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">₹{highestBid.toLocaleString()}</p>
          {highestBidder && (
            <p className="text-sm text-yellow-700 mt-1">{highestBidder}</p>
          )}
        </div>
      )}

      {/* Remaining Budget */}
      <div className={`mb-4 p-3 rounded-lg ${
        remainingBudget < basePrice * 0.2 ? 'bg-red-50' : 'bg-blue-50'
      }`}>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-600">Your Remaining Budget</p>
          {remainingBudget < basePrice * 0.2 && (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          )}
        </div>
        <p className={`text-xl font-bold ${
          remainingBudget < basePrice * 0.2 ? 'text-red-600' : 'text-blue-600'
        }`}>₹{remainingBudget.toLocaleString()}</p>
      </div>

      {/* Minimum Bid Info */}
      <div className="mb-4 text-sm text-gray-600">
        Minimum bid: <span className="font-semibold">₹{minBid.toLocaleString()}</span>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {presetIncrements.map((increment) => {
          const amount = minBid + increment;
          const disabled = amount > remainingBudget;
          return (
            <Button
              key={increment}
              onClick={() => handlePresetBid(increment)}
              disabled={disabled}
              variant="secondary"
              className="text-sm"
            >
              +₹{increment.toLocaleString()}
            </Button>
          );
        })}
      </div>

      {/* Custom Amount */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Custom Amount</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={minBid}
            max={remainingBudget}
          />
          <Button onClick={handleCustomBid}>
            Bid
          </Button>
        </div>
      </div>
    </Card>
  );
};
