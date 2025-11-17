from app.repositories import notification_repo

async def notify_bid_outbid(user_id: int, player_name: str, new_amount: float):
    await notification_repo.create_notification(
        user_id=user_id,
        type="bid_outbid",
        title="You've been outbid!",
        message=f"Your bid on {player_name} has been outbid. New highest bid: ₹{new_amount:,.0f}",
        metadata={"player_name": player_name, "amount": new_amount}
    )

async def notify_player_sold(user_id: int, player_name: str, amount: float):
    await notification_repo.create_notification(
        user_id=user_id,
        type="player_sold",
        title="Player Acquired!",
        message=f"Congratulations! You won {player_name} for ₹{amount:,.0f}",
        metadata={"player_name": player_name, "amount": amount}
    )

async def notify_low_budget(user_id: int, remaining: float):
    await notification_repo.create_notification(
        user_id=user_id,
        type="low_budget",
        title="Low Budget Warning",
        message=f"Your remaining budget is low: ₹{remaining:,.0f}",
        metadata={"remaining_budget": remaining}
    )

async def notify_auction_starting(user_id: int, auction_name: str):
    await notification_repo.create_notification(
        user_id=user_id,
        type="auction_start",
        title="Auction Starting Soon",
        message=f"{auction_name} is about to start!",
        metadata={"auction_name": auction_name}
    )
