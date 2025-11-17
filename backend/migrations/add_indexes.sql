-- Performance optimization indexes

-- Bids table indexes
CREATE INDEX IF NOT EXISTS idx_bids_auction_player ON bids(auction_id, player_id);
CREATE INDEX IF NOT EXISTS idx_bids_team ON bids(team_id);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at DESC);

-- Auction players indexes
CREATE INDEX IF NOT EXISTS idx_auction_players_auction ON auction_players(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_players_status ON auction_players(status);
CREATE INDEX IF NOT EXISTS idx_auction_players_team ON auction_players(sold_to_team_id);

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_tournament ON teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_id);

-- Auctions indexes
CREATE INDEX IF NOT EXISTS idx_auctions_tournament ON auctions(tournament_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- Chat messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_auction ON chat_messages(auction_id);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at DESC);

-- Auto bids indexes
CREATE INDEX IF NOT EXISTS idx_auto_bids_active ON auto_bids(auction_id, player_id, is_active);
CREATE INDEX IF NOT EXISTS idx_auto_bids_team ON auto_bids(team_id);

-- Auction events indexes
CREATE INDEX IF NOT EXISTS idx_events_auction ON auction_events(auction_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON auction_events(timestamp);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bids_auction_amount ON bids(auction_id, amount DESC);
CREATE INDEX IF NOT EXISTS idx_auction_players_sold ON auction_players(auction_id, status, sold_to_team_id);
