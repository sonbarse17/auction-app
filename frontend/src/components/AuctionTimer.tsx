import React, { useMemo } from 'react';
import { Timer } from 'lucide-react';

interface AuctionTimerProps {
  remainingSeconds: number;
  totalSeconds?: number;
  isPaused?: boolean;
}

export const AuctionTimer: React.FC<AuctionTimerProps> = React.memo(({ 
  remainingSeconds, 
  totalSeconds = 30,
  isPaused = false 
}) => {
  const percentage = Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100));
  const isLow = remainingSeconds <= 10;

  // Determine color based on percentage
  const colorClass = useMemo(() => {
    if (remainingSeconds > 20) return 'bg-green-500';
    if (remainingSeconds > 10) return 'bg-yellow-500';
    return 'bg-red-500';
  }, [remainingSeconds]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 text-white/80">
          <Timer size={20} className={isPaused ? 'text-yellow-400' : 'text-white'} />
          <span className="text-sm font-medium uppercase tracking-wider">
            {isPaused ? 'Auction Paused' : 'Time Remaining'}
          </span>
        </div>
        <div className={`text-4xl font-bold tabular-nums transition-colors duration-300 ${
          isLow && !isPaused ? 'text-red-400 animate-pulse' : 'text-white'
        }`}>
          {remainingSeconds}s
        </div>
      </div>
      
      <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden backdrop-blur-sm border border-white/10">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${colorClass} ${
            isPaused ? 'opacity-50' : 'opacity-100'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
});

AuctionTimer.displayName = 'AuctionTimer';
