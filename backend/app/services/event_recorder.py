from app.db.connection import execute
import json
from datetime import datetime

async def record_event(auction_id: int, event_type: str, event_data: dict):
    """Record auction event for replay"""
    await execute(
        """
        INSERT INTO auction_events (auction_id, event_type, event_data, timestamp)
        VALUES ($1, $2, $3, $4)
        """,
        auction_id, event_type, json.dumps(event_data), datetime.utcnow()
    )
