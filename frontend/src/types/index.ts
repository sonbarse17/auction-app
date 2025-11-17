export interface User {
  id: number;
  email: string;
  full_name: string;
  profile_photo?: string;
  is_approved: boolean;
  roles: string[];
  created_at: string;
  updated_at: string;
}

export interface Tournament {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: string;
  squad_rules?: Record<string, { min: number; max: number }>;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: number;
  tournament_id: number;
  name: string;
  owner_id: number;
  budget: number;
  remaining_budget: number;
  max_players: number;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: number;
  name: string;
  sport: string;
  position?: string;
  base_price: number;
  reserve_price?: number;
  rating?: number;
  image_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Auction {
  id: number;
  tournament_id: number;
  name: string;
  status: string;
  current_player_id?: number;
  timer_seconds: number;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Bid {
  id: number;
  auction_id: number;
  player_id: number;
  team_id: number;
  amount: number;
  created_at: string;
}

export interface BidWithTeam extends Bid {
  team_name: string;
}

export interface TeamBudgetSnapshot {
  team_id: number;
  team_name: string;
  budget: number;
  remaining_budget: number;
  spent: number;
}

export interface QueuePlayerSnapshot {
  player_id: number;
  player_name: string;
  order_index: number;
  status: string;
}

export interface TimerState {
  auction_id: number;
  remaining_seconds: number;
  is_running: boolean;
  is_paused: boolean;
}

export interface AuctionPlayer {
  id: number;
  auction_id: number;
  player_id: number;
  status: string;
  sold_to_team_id?: number;
  sold_price?: number;
  order_index: number;
}

export interface AuctionSnapshot {
  auction: Auction;
  current_player?: Player;
  recent_bids: BidWithTeam[];
  team_budgets: TeamBudgetSnapshot[];
  queue_summary: QueuePlayerSnapshot[];
  timer_state: TimerState;
  auction_players: AuctionPlayer[];
}

// WebSocket Events
export interface WSEvent<T = any> {
  type: string;
  data: T;
}

export interface WSBidUpdated {
  bid_id: number;
  team_id: number;
  team_name: string;
  player_id: number;
  amount: number;
  timestamp: string;
}

export interface WSTimerUpdate {
  remaining_seconds: number;
  is_paused: boolean;
}

export interface WSPlayerOnBlock {
  player_id: number;
  player_name: string;
  base_price: number;
  position?: string;
  rating?: number;
  sport?: string;
}

export interface WSPlayerSold {
  player_id: number;
  player_name: string;
  team_id: number;
  team_name: string;
  final_amount: number;
}

export interface WSPlayerUnsold {
  player_id: number;
  player_name: string;
}

export interface WSError {
  message: string;
  code?: string;
}
