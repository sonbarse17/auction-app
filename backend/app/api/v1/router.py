from fastapi import APIRouter
from app.api.v1 import auth, tournaments, teams, players, auctions, bids, timer, admin, undo, notifications, replay, auto_bids, chat, player_stats, analytics, exports, multi_auction, monitoring

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(tournaments.router)
api_router.include_router(teams.router)
api_router.include_router(players.router)
api_router.include_router(auctions.router)
api_router.include_router(bids.router)
api_router.include_router(timer.router)
api_router.include_router(admin.router)
api_router.include_router(undo.router)
api_router.include_router(notifications.router)
api_router.include_router(replay.router)
api_router.include_router(auto_bids.router)
api_router.include_router(chat.router)
api_router.include_router(player_stats.router)
api_router.include_router(analytics.router)
api_router.include_router(exports.router)
api_router.include_router(multi_auction.router)
api_router.include_router(monitoring.router)
