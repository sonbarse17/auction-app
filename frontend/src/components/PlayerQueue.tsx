import React from 'react';
import { List, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { QueuePlayerSnapshot } from '../types';
import { Card } from './Card';

interface PlayerQueueProps {
  queue: QueuePlayerSnapshot[];
}

export const PlayerQueue: React.FC<PlayerQueueProps> = ({ queue }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'unsold':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'unsold':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <List className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Player Queue</h3>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {queue.map((player, index) => (
          <div
            key={player.player_id}
            className={`flex items-center gap-3 p-3 border rounded ${getStatusColor(player.status)}`}
          >
            <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
            {getStatusIcon(player.status)}
            <span className="flex-1 font-medium">{player.player_name}</span>
            <span className="text-xs text-gray-500 uppercase">{player.status}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
