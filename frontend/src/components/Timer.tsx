import React from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  seconds: number;
  isPaused: boolean;
}

export const Timer: React.FC<TimerProps> = ({ seconds, isPaused }) => {
  const isLow = seconds <= 10;
  
  return (
    <div className={`flex items-center gap-2 text-2xl font-bold ${isLow ? 'text-red-600' : 'text-gray-800'}`}>
      <Clock className="w-6 h-6" />
      <span>{seconds}s</span>
      {isPaused && <span className="text-sm text-yellow-600">(Paused)</span>}
    </div>
  );
};
