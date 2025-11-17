import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import axios from 'axios';

interface ReplayEvent {
  id: number;
  event_type: string;
  event_data: any;
  timestamp: string;
}

interface AuctionReplayProps {
  auctionId: number;
}

export const AuctionReplay: React.FC<AuctionReplayProps> = ({ auctionId }) => {
  const [events, setEvents] = useState<ReplayEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [auctionId]);

  useEffect(() => {
    if (!isPlaying || currentIndex >= events.length) return;

    const timer = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 1000 / speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, speed, events.length]);

  const loadEvents = async () => {
    try {
      const { data } = await axios.get(`/api/v1/replay/auctions/${auctionId}/events`);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (currentIndex >= events.length) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const handleSkip = () => {
    setCurrentIndex(prev => Math.min(prev + 1, events.length));
  };

  const getEventDisplay = (event: ReplayEvent) => {
    const data = event.event_data;
    switch (event.event_type) {
      case 'BID_PLACED':
        return `${data.team_name} bid ₹${data.amount?.toLocaleString()} for Player #${data.player_id}`;
      case 'PLAYER_SOLD':
        return `${data.player_name} SOLD to ${data.team_name} for ₹${data.amount?.toLocaleString()}`;
      case 'PLAYER_UNSOLD':
        return `${data.player_name} UNSOLD`;
      default:
        return event.event_type;
    }
  };

  if (loading) return <div className="p-8 text-center">Loading replay...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Auction Replay</h2>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handlePlayPause}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button
          onClick={handleSkip}
          className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          disabled={currentIndex >= events.length}
        >
          <SkipForward size={24} />
        </button>
        <button
          onClick={handleReset}
          className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          <RotateCcw size={24} />
        </button>

        {/* Speed Control */}
        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={5}>5x</option>
        </select>

        <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
          {currentIndex} / {events.length} events
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-6">
        <input
          type="range"
          min={0}
          max={events.length}
          value={currentIndex}
          onChange={(e) => setCurrentIndex(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Event Display */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {events.slice(0, currentIndex).map((event, idx) => (
          <div
            key={event.id}
            className={`p-3 rounded-lg ${
              idx === currentIndex - 1
                ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                : 'bg-gray-50 dark:bg-gray-700'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{getEventDisplay(event)}</span>
              <span className="text-xs text-gray-500">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
