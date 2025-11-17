import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAuctionStore } from '../stores/auctionStore';
import { useAuctionSocket } from '../hooks/useAuctionSocket';
import { auctionApi } from '../services/api';
import { PlayerCard } from '../components/PlayerCard';
import { Timer } from '../components/Timer';
import { AuctionControls } from '../components/AuctionControls';
import { TeamBudgets } from '../components/TeamBudgets';
import { PlayerQueue } from '../components/PlayerQueue';
import { EventLog } from '../components/EventLog';
import { BidHistory } from '../components/BidHistory';
import { ProfileMenu } from '../components/ProfileMenu';
import { LiveChat } from '../components/LiveChat';
import { BarChart3 } from 'lucide-react';
import { Button } from '../components/Button';

export const AuctionControl: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const auctionId = parseInt(id || '0');
  const navigate = useNavigate();
  
  const { token } = useAuthStore();
  const { 
    snapshot, 
    currentPlayer, 
    recentBids, 
    teamBudgets, 
    timerState, 
    eventLog,
    setSnapshot 
  } = useAuctionStore();
  
  const { socket } = useAuctionSocket(auctionId, token || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSnapshot();
  }, [auctionId]);

  const loadSnapshot = async () => {
    try {
      const { data } = await auctionApi.snapshot(auctionId);
      setSnapshot(data);
    } catch (err) {
      console.error('Failed to load snapshot:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      await auctionApi.start(auctionId);
      await loadSnapshot();
    } catch (err) {
      console.error('Failed to start auction:', err);
    }
  };

  const handlePause = async () => {
    try {
      await auctionApi.pause(auctionId);
    } catch (err) {
      console.error('Failed to pause auction:', err);
    }
  };

  const handleResume = async () => {
    try {
      await auctionApi.resume(auctionId);
    } catch (err) {
      console.error('Failed to resume auction:', err);
    }
  };

  const handleNext = async () => {
    try {
      await auctionApi.next(auctionId);
      await loadSnapshot();
    } catch (err) {
      console.error('Failed to move to next player:', err);
    }
  };

  const handleSold = async () => {
    try {
      await auctionApi.next(auctionId);
      await loadSnapshot();
    } catch (err) {
      console.error('Failed to mark as sold:', err);
    }
  };

  const handleUnsold = async () => {
    try {
      await auctionApi.next(auctionId);
      await loadSnapshot();
    } catch (err) {
      console.error('Failed to mark as unsold:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading auction...</div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-red-600">Auction not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{snapshot.auction.name}</h1>
            <p className="text-gray-600">Auction Control Panel</p>
          </div>
          <div className="flex items-center gap-4">
            {timerState && (
              <Timer 
                seconds={timerState.remaining_seconds} 
                isPaused={timerState.is_paused} 
              />
            )}
            <Button onClick={() => navigate(`/results/${auctionId}`)} variant="secondary">
              <BarChart3 className="w-4 h-4 mr-2" />
              Results
            </Button>
            <ProfileMenu />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Current Player & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {currentPlayer ? (
              <PlayerCard player={currentPlayer} />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-xl text-gray-600">No player on block</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AuctionControls
                status={snapshot.auction.status}
                onStart={handleStart}
                onPause={handlePause}
                onResume={handleResume}
                onNext={handleNext}
                onSold={handleSold}
                onUnsold={handleUnsold}
              />
              
              <BidHistory bids={recentBids} />
            </div>

            <EventLog events={eventLog} />
          </div>

          {/* Right Column - Team Budgets & Queue */}
          <div className="space-y-6">
            <TeamBudgets budgets={teamBudgets} />
            <PlayerQueue queue={snapshot.queue_summary} />
          </div>
        </div>
      </div>
      
      <LiveChat auctionId={auctionId} socket={socket} />
    </div>
  );
};
