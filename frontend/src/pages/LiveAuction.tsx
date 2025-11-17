import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAuctionStore } from '../stores/auctionStore';
import { useAuctionSocket } from '../hooks/useAuctionSocket';
import { auctionApi } from '../services/api';
import { User, Star, TrendingUp, MessageCircle, BarChart3 } from 'lucide-react';
import AuctionChat from '../components/AuctionChat';
import PlayerStatsCard from '../components/PlayerStatsCard';
import AutoBidModal from '../components/AutoBidModal';
import AutoBidList from '../components/AutoBidList';

export const LiveAuction: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const auctionId = parseInt(id || '0');
  
  const { token } = useAuthStore();
  const { snapshot, currentPlayer, recentBids, timerState, setSnapshot } = useAuctionStore();
  const { sendMessage, chatMessages } = useAuctionSocket(auctionId, token || '');
  
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAutoBid, setShowAutoBid] = useState(false);
  const [showAutoBidList, setShowAutoBidList] = useState(false);

  useEffect(() => {
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
    
    loadSnapshot();
  }, [auctionId, setSnapshot]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="text-3xl text-white">Loading...</div>
      </div>
    );
  }

  if (!snapshot || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="text-3xl text-white">Waiting for auction to start...</div>
      </div>
    );
  }

  const highestBid = recentBids.length > 0 ? recentBids[0] : null;
  const timerLow = timerState && timerState.remaining_seconds <= 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-8">
      {/* Timer Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">{snapshot.auction.name}</h1>
          {timerState && (
            <div className={`text-6xl font-bold ${
              timerLow ? 'text-red-400 animate-pulse' : 'text-white'
            }`}>
              {timerState.remaining_seconds}s
            </div>
          )}
        </div>
        {timerState && (
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${
                timerLow ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${(timerState.remaining_seconds / 30) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-4 max-w-7xl mx-auto">
        <button
          onClick={() => setShowChat(!showChat)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
        >
          <MessageCircle size={20} />
          Chat
        </button>
        <button
          onClick={() => setShowStats(!showStats)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2"
        >
          <BarChart3 size={20} />
          Stats
        </button>
        <button
          onClick={() => setShowAutoBidList(!showAutoBidList)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
        >
          <TrendingUp size={20} />
          Auto-Bids
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Player Info */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="flex justify-center mb-6">
            {currentPlayer.image_url ? (
              <img
                src={currentPlayer.image_url}
                alt={currentPlayer.name}
                className="w-64 h-64 rounded-full object-cover border-4 border-white/30"
              />
            ) : (
              <div className="w-64 h-64 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-32 h-32 text-white/50" />
              </div>
            )}
          </div>

          <h2 className="text-5xl font-bold text-center mb-4">{currentPlayer.name}</h2>

          <div className="flex items-center justify-center gap-4 mb-6 text-xl">
            <span className="text-white/80">{currentPlayer.sport}</span>
            {currentPlayer.position && (
              <>
                <span className="text-white/50">•</span>
                <span className="text-white/80">{currentPlayer.position}</span>
              </>
            )}
          </div>

          {currentPlayer.rating && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              <span className="text-3xl font-bold">{currentPlayer.rating}</span>
            </div>
          )}

          <div className="text-center mb-4">
            <p className="text-white/70 text-xl mb-2">Base Price</p>
            <p className="text-4xl font-bold text-green-400">
              ₹{currentPlayer.base_price.toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => setShowAutoBid(true)}
            className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold text-lg"
          >
            Set Auto-Bid
          </button>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Current Highest Bid */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8" />
              <h3 className="text-2xl font-bold">Current Highest Bid</h3>
            </div>

            {highestBid ? (
              <>
                <p className="text-7xl font-bold mb-4">
                  ₹{highestBid.amount.toLocaleString()}
                </p>
                <p className="text-2xl font-semibold">{highestBid.team_name}</p>
              </>
            ) : (
              <p className="text-3xl text-white/70">No bids yet</p>
            )}
          </div>

          {/* Recent Bids */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4">Recent Bids</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentBids.length === 0 ? (
                <p className="text-white/50 text-center py-8">No bids yet</p>
              ) : (
                recentBids.slice(0, 5).map((bid, index) => (
                  <div
                    key={bid.id}
                    className={`flex justify-between items-center p-4 rounded-lg ${
                      index === 0 ? 'bg-green-500/30' : 'bg-white/5'
                    }`}
                  >
                    <span className="font-semibold text-lg">{bid.team_name}</span>
                    <span className="text-xl font-bold">₹{bid.amount.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Stats Panel */}
          {showStats && currentPlayer && (
            <PlayerStatsCard playerId={currentPlayer.id} />
          )}

          {/* Auto-Bid List */}
          {showAutoBidList && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4">My Auto-Bids</h3>
              <AutoBidList auctionId={auctionId} />
            </div>
          )}
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="fixed right-0 top-0 h-full w-96 z-50">
          <AuctionChat
            auctionId={auctionId}
            onSendMessage={sendMessage}
            wsMessages={chatMessages}
          />
        </div>
      )}

      {/* Auto-Bid Modal */}
      {showAutoBid && currentPlayer && snapshot && (
        <AutoBidModal
          isOpen={showAutoBid}
          onClose={() => setShowAutoBid(false)}
          auctionId={auctionId}
          auctionPlayerId={snapshot.auction_players.find(ap => ap.player_id === currentPlayer.id)?.id || 0}
          playerName={currentPlayer.name}
          currentBid={highestBid?.amount || currentPlayer.base_price}
        />
      )}
    </div>
  );
};
