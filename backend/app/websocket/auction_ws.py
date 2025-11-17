from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, HTTPException
from app.websocket.manager import manager
from app.services.auth_service import decode_token
from app.services import bidding_service
from app.repositories import team_repo, auction_repo, player_repo
from app.repositories.chat_repo import ChatRepository
from app.schemas.websocket import WSClientMessage, WSEvent, WSPlaceBid, WSPlayerOnBlock, WSError
from app.schemas.bid import BidCreate
from app.core.database import get_db_pool
import json

router = APIRouter()

@router.websocket("/ws/auction/{auction_id}")
async def websocket_auction(websocket: WebSocket, auction_id: int, token: str = Query(...)):
    token_data = decode_token(token)
    if not token_data:
        await websocket.close(code=1008)
        return
    
    # Get user's team for this auction
    auction = await auction_repo.get_auction(auction_id)
    if not auction:
        await websocket.close(code=1008)
        return
    
    team = await team_repo.get_team_by_owner(auction.tournament_id, token_data.user_id)
    team_id = team.id if team else None
    
    pool = await get_db_pool()
    chat_repo = ChatRepository(pool)
    
    await manager.connect(websocket, auction_id, token_data.user_id, team_id)
    
    # Send current auction state
    if auction.current_player_id:
        player = await player_repo.get_player(auction.current_player_id)
        if player:
            event = WSEvent(
                type="PLAYER_ON_BLOCK",
                data=WSPlayerOnBlock(
                    player_id=player.id,
                    player_name=player.name,
                    base_price=player.base_price,
                    position=player.position,
                    rating=player.rating,
                    sport=player.sport
                ).model_dump()
            )
            await manager.send_personal_message(websocket, event)
    
    try:
        while True:
            data = await websocket.receive_text()
            message_dict = json.loads(data)
            
            try:
                client_msg = WSClientMessage(**message_dict)
                
                if client_msg.type == "CHAT_MESSAGE":
                    message_text = client_msg.data.get('message', '')
                    if message_text:
                        msg = await chat_repo.create_message(auction_id, token_data.user_id, message_text)
                        chat_event = WSEvent(
                            type="CHAT_MESSAGE",
                            data={
                                "id": msg['id'],
                                "user_id": msg['user_id'],
                                "username": msg['username'],
                                "team_name": msg.get('team_name'),
                                "message": msg['message'],
                                "created_at": msg['created_at'].isoformat()
                            }
                        )
                        await manager.broadcast_to_auction(auction_id, chat_event)
                
                elif client_msg.type == "PLACE_BID":
                    if not team_id:
                        error_event = WSEvent(
                            type="ERROR",
                            data=WSError(message="No team found for this tournament").model_dump()
                        )
                        await manager.send_personal_message(websocket, error_event)
                        continue
                    
                    bid_data = WSPlaceBid(**client_msg.data)
                    bid_create = BidCreate(
                        auction_id=bid_data.auction_id,
                        player_id=bid_data.player_id,
                        amount=bid_data.amount
                    )
                    
                    try:
                        await bidding_service.place_bid(bid_create, team_id)
                    except bidding_service.BidError as e:
                        error_event = WSEvent(
                            type="ERROR",
                            data=WSError(message=str(e)).model_dump()
                        )
                        await manager.send_personal_message(websocket, error_event)
            
            except Exception as e:
                error_event = WSEvent(
                    type="ERROR",
                    data=WSError(message=f"Invalid message: {str(e)}").model_dump()
                )
                await manager.send_personal_message(websocket, error_event)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, auction_id)
