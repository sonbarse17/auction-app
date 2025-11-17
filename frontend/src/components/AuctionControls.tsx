import React from 'react';
import { Play, Pause, SkipForward, CheckCircle, XCircle, Undo } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface AuctionControlsProps {
  status: string;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onNext: () => void;
  onSold: () => void;
  onUnsold: () => void;
  onUndo?: () => void;
}

export const AuctionControls: React.FC<AuctionControlsProps> = ({
  status,
  onStart,
  onPause,
  onResume,
  onNext,
  onSold,
  onUnsold,
  onUndo,
}) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Auction Controls</h3>
      
      <div className="space-y-3">
        {status === 'pending' && (
          <Button onClick={onStart} className="w-full">
            <Play className="w-4 h-4 mr-2" />
            Start Auction
          </Button>
        )}
        
        {status === 'active' && (
          <>
            <Button onClick={onPause} variant="secondary" className="w-full">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={onSold} className="w-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                Sold
              </Button>
              <Button onClick={onUnsold} variant="danger" className="w-full">
                <XCircle className="w-4 h-4 mr-2" />
                Unsold
              </Button>
            </div>
            
            <Button onClick={onNext} variant="secondary" className="w-full">
              <SkipForward className="w-4 h-4 mr-2" />
              Next Player
            </Button>
            
            {onUndo && (
              <Button onClick={onUndo} variant="danger" className="w-full">
                <Undo className="w-4 h-4 mr-2" />
                Undo Last Bid
              </Button>
            )}
          </>
        )}
        
        {status === 'paused' && (
          <Button onClick={onResume} className="w-full">
            <Play className="w-4 h-4 mr-2" />
            Resume
          </Button>
        )}
        
        {status === 'completed' && (
          <div className="text-center py-4 text-gray-600">
            Auction Completed
          </div>
        )}
      </div>
    </Card>
  );
};
