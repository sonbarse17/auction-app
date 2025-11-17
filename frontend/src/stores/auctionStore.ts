import { create } from 'zustand';
import type { AuctionSnapshot, Player, BidWithTeam, TeamBudgetSnapshot, TimerState } from '../types';

interface LogEvent {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
}

interface AuctionState {
  snapshot: AuctionSnapshot | null;
  currentPlayer: Player | null;
  recentBids: BidWithTeam[];
  teamBudgets: TeamBudgetSnapshot[];
  timerState: TimerState | null;
  eventLog: LogEvent[];
  
  setSnapshot: (snapshot: AuctionSnapshot) => void;
  updateCurrentPlayer: (player: Player) => void;
  addBid: (bid: BidWithTeam) => void;
  updateTimer: (remaining: number, isPaused: boolean) => void;
  updateTeamBudget: (teamId: number, spent: number) => void;
  addEvent: (type: string, message: string) => void;
  reset: () => void;
}

export const useAuctionStore = create<AuctionState>((set) => ({
  snapshot: null,
  currentPlayer: null,
  recentBids: [],
  teamBudgets: [],
  timerState: null,
  eventLog: [],

  setSnapshot: (snapshot) => set({
    snapshot,
    currentPlayer: snapshot.current_player || null,
    recentBids: snapshot.recent_bids,
    teamBudgets: snapshot.team_budgets,
    timerState: snapshot.timer_state,
  }),

  updateCurrentPlayer: (player) => set({ currentPlayer: player }),

  addBid: (bid) => set((state) => ({
    recentBids: [bid, ...state.recentBids].slice(0, 10),
  })),

  updateTimer: (remaining, isPaused) => set((state) => ({
    timerState: state.timerState ? { ...state.timerState, remaining_seconds: remaining, is_paused: isPaused } : null,
  })),

  updateTeamBudget: (teamId, spent) => set((state) => ({
    teamBudgets: state.teamBudgets.map((t) =>
      t.team_id === teamId ? { ...t, spent, remaining_budget: t.budget - spent } : t
    ),
  })),

  addEvent: (type, message) => set((state) => ({
    eventLog: [
      { id: Date.now().toString(), type, message, timestamp: new Date() },
      ...state.eventLog,
    ].slice(0, 50),
  })),

  reset: () => set({
    snapshot: null,
    currentPlayer: null,
    recentBids: [],
    teamBudgets: [],
    timerState: null,
    eventLog: [],
  }),
}));
