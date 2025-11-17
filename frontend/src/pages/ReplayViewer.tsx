import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuctionReplay } from '../components/AuctionReplay';
import { ProfileMenu } from '../components/ProfileMenu';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

export const ReplayViewer: React.FC = () => {
  const { auctionId } = useParams<{ auctionId: string }>();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (auctionId) {
      loadSummary();
    }
  }, [auctionId]);

  const loadSummary = async () => {
    try {
      const { data } = await axios.get(`/api/v1/replay/auctions/${auctionId}/summary`);
      setSummary(data);
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Auction Replay</h1>
              {summary && (
                <p className="text-gray-600 dark:text-gray-400">
                  {summary.name} - {summary.event_count} events
                </p>
              )}
            </div>
          </div>
          <ProfileMenu />
        </div>

        {auctionId && <AuctionReplay auctionId={parseInt(auctionId)} />}
      </div>
    </div>
  );
};
