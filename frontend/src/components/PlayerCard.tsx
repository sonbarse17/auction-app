import React, { useRef, useState } from 'react';
import { User, Star, Trophy, Activity } from 'lucide-react';
import type { Player } from '../types';

interface PlayerCardProps {
  player: Player;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; // Max 10 degrees
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-sm mx-auto transition-transform duration-200 ease-out preserve-3d"
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
      }}
    >
      {/* Glassmorphism Card */}
      <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 text-white">
        {/* Background Gradient Blob */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl pointer-events-none" />

        {/* Player Image */}
        <div className="relative z-10 flex justify-center mb-6">
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full animate-pulse opacity-50 blur-lg" />
            {player.image_url ? (
              <img
                src={player.image_url}
                alt={player.name}
                className="relative w-full h-full rounded-full object-cover border-4 border-white/30 shadow-lg"
              />
            ) : (
              <div className="relative w-full h-full rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
                <User className="w-20 h-20 text-white/70" />
              </div>
            )}
            {/* Rating Badge */}
            {player.rating && (
              <div className="absolute -bottom-2 right-0 bg-yellow-500 text-black font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Star size={14} className="fill-black" />
                {player.rating}
              </div>
            )}
          </div>
        </div>

        {/* Player Info */}
        <div className="relative z-10 text-center space-y-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-1">{player.name}</h2>
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm uppercase tracking-wider font-medium">
              <span className="flex items-center gap-1">
                <Trophy size={14} />
                {player.sport}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Activity size={14} />
                {player.position || 'N/A'}
              </span>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="flex flex-col items-center">
            <span className="text-white/60 text-sm mb-1">Base Price</span>
            <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400">
              ₹{player.base_price.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
