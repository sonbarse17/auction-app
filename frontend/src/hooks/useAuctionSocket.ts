import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuctionStore } from '../stores/auctionStore';
import type { WSEvent, WSBidUpdated, WSTimerUpdate, WSPlayerOnBlock, WSPlayerSold, WSPlayerUnsold } from '../types';

export const useAuctionSocket = (auctionId: number, token: string) => {
  const wsRef = useRef<WebSocket | null>(null);
  const { addBid, updateTimer, updateCurrentPlayer, updateTeamBudget, addEvent } = useAuctionStore();
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  const connect = useCallback(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.host;
    const ws = new WebSocket(`${wsProtocol}//${wsHost}/ws/auction/${auctionId}?token=${token}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const message: WSEvent = JSON.parse(event.data);
      
      switch (message.type) {
        case 'BID_UPDATED': {
          const data = message.data as WSBidUpdated;
          addBid({
            id: data.bid_id,
            auction_id: auctionId,
            player_id: data.player_id,
            team_id: data.team_id,
            team_name: data.team_name,
            amount: data.amount,
            created_at: data.timestamp,
          });
          addEvent('BID_UPDATED', `${data.team_name} bid ₹${data.amount.toLocaleString()}`);
          break;
        }

        case 'TIMER_TICK': {
          const data = message.data as WSTimerUpdate;
          updateTimer(data.remaining_seconds, data.is_paused);
          break;
        }

        case 'PLAYER_ON_BLOCK': {
          const data = message.data as WSPlayerOnBlock;
          updateCurrentPlayer({
            id: data.player_id,
            name: data.player_name,
            base_price: data.base_price,
            position: data.position,
            rating: data.rating,
            sport: data.sport || '',
            created_at: '',
            updated_at: '',
          });
          addEvent('PLAYER_ON_BLOCK', `${data.player_name} is now on block`);
          break;
        }

        case 'PLAYER_SOLD': {
          const data = message.data as WSPlayerSold;
          updateTeamBudget(data.team_id, data.final_amount);
          addEvent('PLAYER_SOLD', `${data.player_name} sold to ${data.team_name} for ₹${data.final_amount.toLocaleString()}`);
          break;
        }

        case 'PLAYER_UNSOLD': {
          const data = message.data as WSPlayerUnsold;
          addEvent('PLAYER_UNSOLD', `${data.player_name} went unsold`);
          break;
        }

        case 'CHAT_MESSAGE': {
          setChatMessages(prev => [...prev, message.data]);
          break;
        }

        case 'ERROR': {
          console.error('WebSocket error:', message.data);
          break;
        }
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    wsRef.current = ws;
  }, [auctionId, token, addBid, updateTimer, updateCurrentPlayer, updateTeamBudget]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendBid = useCallback((playerId: number, amount: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'PLACE_BID',
        data: {
          auction_id: auctionId,
          player_id: playerId,
          amount,
        },
      }));
    }
  }, [auctionId]);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'CHAT_MESSAGE',
        data: { message },
      }));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { sendBid, sendMessage, chatMessages, disconnect, socket: wsRef.current };
};
