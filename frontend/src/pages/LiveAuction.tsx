import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAuctionStore } from '../stores/auctionStore';
import { useAuctionSocket } from '../hooks/useAuctionSocket';
import { auctionApi } from '../services/api';
import { MessageCircle, BarChart3, TrendingUp, Wallet } from 'lucide-react';
import AuctionChat from '../components/AuctionChat';
import PlayerStatsCard from '../components/PlayerStatsCard';
import AutoBidModal from '../components/AutoBidModal';
import AutoBidList from '../components/AutoBidList';
import { AuctionTimer } from '../components/AuctionTimer';
import { RecentBids } from '../components/RecentBids';
import { PlayerCard } from '../components/PlayerCard';

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

  const highestBid = useMemo(() => recentBids.length > 0 ? recentBids[0] : null, [recentBids]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="mt-4 text-xl text-white font-light tracking-wider">Loading Arena...</div>
        </div>
      </div>
    );
  }

  if (!snapshot || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-3xl text-white font-light tracking-wider animate-pulse">Waiting for auction to start...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 lg:p-8 overflow-x-hidden">
      {/* Header & Timer */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
              {snapshot.auction.name}
            </h1>
            <div className="flex items-center gap-2 text-white/60">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm uppercase tracking-widest">Live Auction Arena</span>
            </div>
          </div>

          <div className="w-full md:w-96">
            {timerState && (
              <AuctionTimer
                remainingSeconds={timerState.remaining_seconds}
                isPaused={timerState.is_paused}
              />
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 ${showChat
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-white/5 hover:bg-white/10 text-white/80'
              }`}
          >
            <MessageCircle size={18} />
            Chat
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 ${showStats
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                : 'bg-white/5 hover:bg-white/10 text-white/80'
              }`}
          >
            <BarChart3 size={18} />
            Stats
          </button>
          <button
            onClick={() => setShowAutoBidList(!showAutoBidList)}
            className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 ${showAutoBidList
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                : 'bg-white/5 hover:bg-white/10 text-white/80'
              }`}
          >
            <Wallet size={18} />
            Auto-Bids
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Center Stage: Player Card */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="relative z-10">
              <PlayerCard player={currentPlayer} />
            </div>

            <button
              onClick={() => setShowAutoBid(true)}
              className="w-full max-w-sm mx-auto px-6 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-2xl font-bold text-lg shadow-xl shadow-orange-900/20 transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <Wallet className="w-5 h-5" />
              Place Auto-Bid
            </button>
          </div>

          {/* Right Column: Bids & Stats */}
          <div className="lg:col-span-7 space-y-6">
            {/* Current Highest Bid */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-150" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2 text-emerald-100">
                  <TrendingUp className="w-6 h-6" />
                  <h3 className="text-lg font-medium uppercase tracking-wider">Current Highest Bid</h3>
                </div>

                {highestBid ? (
                  <div className="mt-4">
                    <p className="text-7xl font-bold text-white tracking-tight mb-2">
                      ₹{highestBid.amount.toLocaleString()}
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/20 rounded-full backdrop-blur-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <p className="text-xl font-medium text-emerald-100">{highestBid.team_name}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-4xl text-white/40 mt-4 font-light">Waiting for bids...</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RecentBids bids={recentBids} />

              {showAutoBidList && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold mb-4">My Auto-Bids</h3>
                  <AutoBidList auctionId={auctionId} />
                </div>
              )}
            </div>

            {showStats && currentPlayer && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PlayerStatsCard playerId={currentPlayer.id} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Sidebar Overlay */}
      <div className={`fixed right-0 top-0 h-full w-full md:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transform transition-transform duration-300 z-50 ${showChat ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MessageCircle className="text-blue-400" />
              Live Chat
            </h3>
            <button
              onClick={() => setShowChat(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <AuctionChat
              auctionId={auctionId}
              onSendMessage={sendMessage}
              wsMessages={chatMessages}
            />
          </div>
        </div>
      </div>

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
