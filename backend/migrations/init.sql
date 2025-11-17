-- Sports Player Auction Platform Schema

-- Drop tables if exist (for clean re-runs)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS auction_players CASCADE;
DROP TABLE IF EXISTS auctions CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    profile_photo TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- User roles junction table
CREATE TABLE user_roles (
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Tournaments table
CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'draft',
    squad_rules JSONB,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Teams table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    owner_id INTEGER NOT NULL,
    budget DECIMAL(15, 2) NOT NULL,
    remaining_budget DECIMAL(15, 2) NOT NULL,
    max_players INTEGER DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT,
    UNIQUE (tournament_id, name)
);

-- Players table
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sport VARCHAR(100) NOT NULL,
    position VARCHAR(100),
    base_price DECIMAL(15, 2) NOT NULL,
    reserve_price DECIMAL(15, 2),
    rating DECIMAL(3, 1),
    image_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auctions table
CREATE TABLE auctions (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    current_player_id INTEGER,
    timer_seconds INTEGER DEFAULT 30,
    bid_increment DECIMAL(15, 2) DEFAULT 10000,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (current_player_id) REFERENCES players(id) ON DELETE SET NULL
);

-- Auction players queue
CREATE TABLE auction_players (
    id SERIAL PRIMARY KEY,
    auction_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    sold_to_team_id INTEGER,
    final_price DECIMAL(15, 2),
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (sold_to_team_id) REFERENCES teams(id) ON DELETE SET NULL,
    UNIQUE (auction_id, player_id)
);

CREATE INDEX idx_auction_players_queue ON auction_players(auction_id, order_index);

-- Bids table
CREATE TABLE bids (
    id SERIAL PRIMARY KEY,
    auction_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE INDEX idx_bids_auction_player ON bids(auction_id, player_id);

-- Audit logs table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- Seed data
INSERT INTO roles (name, description) VALUES
    ('admin', 'Platform administrator'),
    ('organizer', 'Tournament organizer'),
    ('team_owner', 'Team owner who can bid'),
    ('spectator', 'View-only access');

-- Sample admin user (password: admin123)
-- Hash generated with: bcrypt.hashpw(b'admin123', bcrypt.gensalt())
INSERT INTO users (email, password_hash, full_name, is_approved) VALUES
    ('admin@auction.com', '$2b$12$CpaDxyb6PZyEajQHtRjjq.QUhI5nJNCkmu6.upeq5nqAh.zoxcFcy', 'Admin User', TRUE);

INSERT INTO user_roles (user_id, role_id) VALUES
    (1, 1)
ON CONFLICT DO NOTHING;

-- Sample tournament
INSERT INTO tournaments (name, description, start_date, status, squad_rules, created_by) VALUES
    ('IPL 2024 Auction', 'Indian Premier League player auction', '2024-02-01 10:00:00', 'draft', 
     '{"Batsman": {"min": 3, "max": 6}, "Bowler": {"min": 3, "max": 6}, "All-rounder": {"min": 2, "max": 4}, "Wicket-keeper": {"min": 1, "max": 2}}', 1);

-- Sample players
INSERT INTO players (name, sport, position, base_price, reserve_price, rating) VALUES
    ('Virat Kohli', 'Cricket', 'Batsman', 200000, 250000, 9.5),
    ('Jasprit Bumrah', 'Cricket', 'Bowler', 200000, 250000, 9.3),
    ('Rohit Sharma', 'Cricket', 'Batsman', 200000, 250000, 9.4),
    ('Ravindra Jadeja', 'Cricket', 'All-rounder', 150000, 180000, 9.0),
    ('KL Rahul', 'Cricket', 'Wicket-keeper', 150000, 180000, 8.8),
    ('Mohammed Shami', 'Cricket', 'Bowler', 100000, 120000, 8.5),
    ('Hardik Pandya', 'Cricket', 'All-rounder', 150000, 180000, 8.7),
    ('Rishabh Pant', 'Cricket', 'Wicket-keeper', 150000, 180000, 8.9);
