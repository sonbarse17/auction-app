import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAuctionStore } from '../stores/auctionStore';
import { useAuctionSocket } from '../hooks/useAuctionSocket';
import { auctionApi, teamApi } from '../services/api';
import { PlayerCard } from '../components/PlayerCard';
import { BidPanel } from '../components/BidPanel';
import { Timer } from '../components/Timer';
import { BidHistory } from '../components/BidHistory';
import { AutoBidPanel } from '../components/AutoBidPanel';
import { LiveChat } from '../components/LiveChat';
import type { Team } from '../types';

export const OwnerAuction: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const auctionId = parseInt(id || '0');
  
  const { token, user } = useAuthStore();
  const { snapshot, currentPlayer, recentBids, timerState, teamBudgets, setSnapshot } = useAuctionStore();
  const { sendBid, socket } = useAuctionSocket(auctionId, token || '');
  
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuctionData();
  }, [auctionId]);

  const loadAuctionData = async () => {
    try {
      const { data: snapshotData } = await auctionApi.snapshot(auctionId);
      setSnapshot(snapshotData);

      // Get user's team
      if (user) {
        const { data: teams } = await teamApi.list(snapshotData.auction.tournament_id);
        const userTeam = teams.find(t => t.owner_id === user.id);
        setMyTeam(userTeam || null);
      }
    } catch (err) {
      console.error('Failed to load auction:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = (amount: number) => {
    if (currentPlayer) {
      sendBid(currentPlayer.id, amount);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading auction...</div>
      </div>
    );
  }

  if (!snapshot || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Waiting for auction to start...</div>
      </div>
    );
  }

  if (!myTeam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-red-600">You don't have a team in this tournament</div>
      </div>
    );
  }

  const myBudget = teamBudgets.find(t => t.team_id === myTeam.id);
  const remainingBudget = myBudget?.remaining_budget || myTeam.remaining_budget;
  
  const highestBid = recentBids.length > 0 ? recentBids[0] : null;
  const isMyBid = highestBid?.team_id === myTeam.id;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{snapshot.auction.name}</h1>
            <p className="text-gray-600">{myTeam.name}</p>
          </div>
          {timerState && (
            <Timer 
              seconds={timerState.remaining_seconds} 
              isPaused={timerState.is_paused} 
            />
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Player & Bid Panel */}
          <div className="lg:col-span-2 space-y-6">
            <PlayerCard player={currentPlayer} />

            {/* Your Bid Status */}
            {isMyBid && (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                <p className="text-green-800 font-semibold text-center">
                  🎉 You have the highest bid!
                </p>
              </div>
            )}

            <BidPanel
              basePrice={currentPlayer.base_price}
              highestBid={highestBid?.amount || null}
              highestBidder={highestBid?.team_name || null}
              remainingBudget={remainingBudget}
              onPlaceBid={handlePlaceBid}
            />
            
            <AutoBidPanel
              auctionId={auctionId}
              playerId={currentPlayer.id}
              playerName={currentPlayer.name}
              currentBid={highestBid?.amount || currentPlayer.base_price}
              teamId={myTeam.id}
            />
          </div>

          {/* Right Column - Bid History */}
          <div>
            <BidHistory bids={recentBids} />
          </div>
        </div>
      </div>
      
      <LiveChat auctionId={auctionId} socket={socket} />
    </div>
  );
};
