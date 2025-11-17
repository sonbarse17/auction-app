import React from 'react';
import { User, Star } from 'lucide-react';
import type { Player } from '../types';
import { Card } from './Card';

interface PlayerCardProps {
  player: Player;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  return (
    <Card className="text-center">
      <div className="flex justify-center mb-4">
        {player.image_url ? (
          <img src={player.image_url} alt={player.name} className="w-32 h-32 rounded-full object-cover" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>
      
      <h2 className="text-2xl font-bold mb-2">{player.name}</h2>
      
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-gray-600">{player.sport}</span>
        {player.position && <span className="text-gray-400">• {player.position}</span>}
      </div>
      
      {player.rating && (
        <div className="flex items-center justify-center gap-1 mb-4">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="font-semibold">{player.rating}</span>
        </div>
      )}
      
      <div className="text-lg">
        <span className="text-gray-600">Base Price: </span>
        <span className="font-bold text-green-600">₹{player.base_price.toLocaleString()}</span>
      </div>
    </Card>
  );
};
