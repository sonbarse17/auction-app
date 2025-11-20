import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { BidWithTeam } from '../types';

interface RecentBidsProps {
    bids: BidWithTeam[];
}

export const RecentBids: React.FC<RecentBidsProps> = React.memo(({ bids }) => {
    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className="text-xl font-bold">Recent Bids</h3>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {bids.length === 0 ? (
                    <p className="text-white/50 text-center py-8">No bids yet</p>
                ) : (
                    bids.slice(0, 5).map((bid, index) => (
                        <div
                            key={bid.id}
                            className={`flex justify-between items-center p-4 rounded-xl transition-all duration-300 ${index === 0
                                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 scale-102'
                                    : 'bg-white/5 hover:bg-white/10 border border-white/5'
                                }`}
                        >
                            <div className="flex flex-col">
                                <span className="font-semibold text-lg">{bid.team_name}</span>
                                <span className="text-xs text-white/40">
                                    {new Date(bid.created_at).toLocaleTimeString()}
                                </span>
                            </div>
                            <span className={`text-xl font-bold ${index === 0 ? 'text-green-400' : 'text-white/80'
                                }`}>
                                ₹{bid.amount.toLocaleString()}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
});

RecentBids.displayName = 'RecentBids';
