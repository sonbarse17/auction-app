from fastapi import WebSocket
from typing import Dict, List, Optional
from app.schemas.websocket import WSEvent

class ConnectionInfo:
    def __init__(self, websocket: WebSocket, user_id: int, team_id: Optional[int]):
        self.websocket = websocket
        self.user_id = user_id
        self.team_id = team_id

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[ConnectionInfo]] = {}
    
    async def connect(self, websocket: WebSocket, auction_id: int, user_id: int, team_id: Optional[int]):
        await websocket.accept()
        if auction_id not in self.active_connections:
            self.active_connections[auction_id] = []
        
        conn_info = ConnectionInfo(websocket, user_id, team_id)
        self.active_connections[auction_id].append(conn_info)
    
    def disconnect(self, websocket: WebSocket, auction_id: int):
        if auction_id in self.active_connections:
            self.active_connections[auction_id] = [
                conn for conn in self.active_connections[auction_id]
                if conn.websocket != websocket
            ]
            if not self.active_connections[auction_id]:
                del self.active_connections[auction_id]
    
    async def broadcast_to_auction(self, auction_id: int, event: WSEvent):
        if auction_id in self.active_connections:
            disconnected = []
            message = event.model_dump()
            
            for conn_info in self.active_connections[auction_id]:
                try:
                    await conn_info.websocket.send_json(message)
                except:
                    disconnected.append(conn_info.websocket)
            
            for ws in disconnected:
                self.disconnect(ws, auction_id)
    
    async def send_personal_message(self, websocket: WebSocket, event: WSEvent):
        await websocket.send_json(event.model_dump())
    
    def get_user_team(self, websocket: WebSocket, auction_id: int) -> Optional[int]:
        if auction_id in self.active_connections:
            for conn_info in self.active_connections[auction_id]:
                if conn_info.websocket == websocket:
                    return conn_info.team_id
        return None

manager = ConnectionManager()
